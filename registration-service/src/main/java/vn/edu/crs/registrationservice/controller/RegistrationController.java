package vn.edu.crs.registrationservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.crs.registrationservice.dto.RegistrationRequestDTO;
import vn.edu.crs.registrationservice.entity.Registration;
import vn.edu.crs.registrationservice.service.RegistrationService;

import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<Registration> register(@RequestBody @Valid RegistrationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Registration>> getMyRegistrations(Authentication authentication) {
        // Lấy studentId được lưu trong credentials từ JwtAuthFilter
        Long studentId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(registrationService.getMyRegistrations(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}