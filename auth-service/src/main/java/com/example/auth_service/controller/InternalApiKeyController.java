package com.example.auth_service.controller;

import com.example.auth_service.service.ApiKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal/api-keys")
@RequiredArgsConstructor
public class InternalApiKeyController {

    private final ApiKeyService apiKeyService;

    /**
     * Endpoint nội bộ dành riêng cho api-gateway.
     * URL: GET /internal/api-keys/validate?key=...&scope=courses:read
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validate(
            @RequestParam("key") String key,
            @RequestParam("scope") String scope) {

        boolean isValid = apiKeyService.isValidForScope(key, scope);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }
}