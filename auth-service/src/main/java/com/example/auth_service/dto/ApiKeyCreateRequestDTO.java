package com.example.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApiKeyCreateRequestDTO {

    @NotBlank(message = "Ten doi tac khong duoc de trong")
    private String ownerName;

    @NotBlank(message = "Danh sach scope khong duoc de trong")
    private String scopes; // Vi du: "courses:read"

    private Integer validDays; // So ngay hieu luc; null = khong gioi han
}