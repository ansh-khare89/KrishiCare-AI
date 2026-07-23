package com.krishicare.backend.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String name
) {}
