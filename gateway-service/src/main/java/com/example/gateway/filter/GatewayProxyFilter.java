package com.example.gateway.filter;

import com.example.gateway.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

/**
 * Gateway Proxy Filter:
 * Handling security & routing for all 8 required endpoints.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GatewayProxyFilter extends OncePerRequestFilter {

    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    @Value("${gateway.auth-service-url}")
    private String authServiceUrl;

    @Value("${gateway.course-service-url}")
    private String courseServiceUrl;

    @Value("${gateway.registration-service-url}")
    private String registrationServiceUrl;

    @Value("${gateway.partner-api-key}")
    private String partnerApiKey;

    private static final Set<String> EXCLUDED_HEADERS = Set.of(
            "host", "connection", "transfer-encoding", "content-length"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        log.info("[Gateway] {} {}", method, path);

        // CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");

        // Handle preflight OPTIONS request
        if ("OPTIONS".equalsIgnoreCase(method)) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String targetUrl = null;

        // 1. API Partner (7 & 8): /api/public/** -> Requires X-API-KEY -> course-service /courses
        if (path.startsWith("/api/public")) {
            String apiKey = request.getHeader("X-API-KEY");
            if (!partnerApiKey.equals(apiKey)) {
                log.warn("[Gateway] 403 Forbidden - Missing or invalid X-API-KEY: {}", apiKey);
                sendError(response, HttpStatus.FORBIDDEN, "API Key khong hop le hoac bi thieu");
                return;
            }
            // /api/public/courses -> http://localhost:8083/courses
            String subPath = path.substring("/api/public".length());
            if (subPath.isEmpty()) subPath = "/courses";
            targetUrl = courseServiceUrl + subPath;
        }
        // 2. Auth Service (1): /api/auth/** -> Public -> auth-service /auth/...
        else if (path.startsWith("/api/auth/")) {
            targetUrl = authServiceUrl + path.substring(4); // strip "/api"
        }
        // 3. Courses (2, 3, 4, 5): /api/courses/** -> course-service /courses/...
        else if (path.startsWith("/api/courses")) {
            // GET /api/courses is Public (Request 2)
            if ("GET".equalsIgnoreCase(method)) {
                targetUrl = courseServiceUrl + path.substring(4);
            } else {
                // POST/PUT/DELETE require JWT (Requests 3, 4, 5)
                if (!validateToken(request, response)) return;
                targetUrl = courseServiceUrl + path.substring(4);
            }
        }
        // 4. Registrations (6): /api/registrations/** -> Requires JWT -> registration-service /registrations/...
        else if (path.startsWith("/api/registrations")) {
            if (!validateToken(request, response)) return;
            targetUrl = registrationServiceUrl + path.substring(4);
        }
        else {
            sendError(response, HttpStatus.NOT_FOUND, "Khong tim thấy route cho: " + path);
            return;
        }

        // Add query parameters if present
        String query = request.getQueryString();
        if (query != null && !query.isBlank()) {
            targetUrl += "?" + query;
        }

        // Forward request
        HttpHeaders headers = buildForwardHeaders(request);
        byte[] body = request.getInputStream().readAllBytes();
        HttpEntity<byte[]> entity = new HttpEntity<>(body.length > 0 ? body : null, headers);

        try {
            ResponseEntity<byte[]> backendResponse = restTemplate.exchange(
                    targetUrl, HttpMethod.valueOf(method), entity, byte[].class
            );
            writeResponse(response, backendResponse);
        } catch (HttpClientErrorException e) {
            log.warn("[Gateway] Backend returned {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            response.setStatus(e.getStatusCode().value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(e.getResponseBodyAsString());
        } catch (HttpServerErrorException e) {
            log.error("[Gateway] Backend error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            response.setStatus(e.getStatusCode().value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("[Gateway] Cannot connect to backend: {}", targetUrl);
            sendError(response, HttpStatus.SERVICE_UNAVAILABLE, "Service phia sau khong kha dung");
        }
    }

    private boolean validateToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[Gateway] 401 Unauthorized - Missing Authorization header");
            sendError(response, HttpStatus.UNAUTHORIZED, "Thieu token xac thuc");
            return false;
        }
        try {
            jwtUtil.parseToken(authHeader.substring(7));
            return true;
        } catch (JwtException e) {
            log.warn("[Gateway] 401 Unauthorized - Invalid JWT: {}", e.getMessage());
            sendError(response, HttpStatus.UNAUTHORIZED, "Token khong hop le hoac da het han");
            return false;
        }
    }

    private HttpHeaders buildForwardHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames()).forEach(name -> {
            if (!EXCLUDED_HEADERS.contains(name.toLowerCase())) {
                headers.set(name, request.getHeader(name));
            }
        });

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                headers.set("X-User-Role", jwtUtil.extractRole(token));
                headers.set("X-User-Name", jwtUtil.extractUsername(token));
            } catch (JwtException ignored) {}
        }
        headers.set("X-Forwarded-By", "crs-gateway");
        return headers;
    }

    private void writeResponse(HttpServletResponse response, ResponseEntity<byte[]> backendResponse) throws IOException {
        response.setStatus(backendResponse.getStatusCode().value());
        backendResponse.getHeaders().forEach((name, values) -> {
            if (!"transfer-encoding".equalsIgnoreCase(name)) {
                values.forEach(value -> response.addHeader(name, value));
            }
        });
        response.setHeader("Access-Control-Allow-Origin", "*");
        if (backendResponse.getBody() != null && backendResponse.getBody().length > 0) {
            response.getOutputStream().write(backendResponse.getBody());
        }
    }

    private void sendError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
            "{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
            status.value(), status.getReasonPhrase(), message
        ));
    }
}