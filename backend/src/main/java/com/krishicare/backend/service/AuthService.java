package com.krishicare.backend.service;

import com.krishicare.backend.dto.AuthResponse;
import com.krishicare.backend.dto.LoginRequest;
import com.krishicare.backend.dto.RegisterRequest;
import com.krishicare.backend.model.User;
import com.krishicare.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        String cleanName = request.name() != null ? request.name().trim() : "";
        if (cleanEmail.isEmpty() || request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Email and password cannot be blank.");
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalStateException("Email already registered.");
        }

        User user = new User();
        user.setName(cleanName);
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        return tokensFor(user);
    }

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalStateException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalStateException("Invalid email or password.");
        }

        return tokensFor(user);
    }


    public AuthResponse refresh(String refreshToken) {
        Claims claims = jwtService.parseToken(refreshToken);
        if (!jwtService.isRefreshToken(claims)) {
            throw new IllegalStateException("Invalid refresh token.");
        }

        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found."));

        return tokensFor(user);
    }

    public com.krishicare.backend.dto.UserProfile getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found."));
        return new com.krishicare.backend.dto.UserProfile(user.getId(), user.getEmail(), user.getName());
    }

    private AuthResponse tokensFor(User user) {
        return new AuthResponse(
                jwtService.generateAccessToken(user.getId(), user.getEmail()),
                jwtService.generateRefreshToken(user.getId(), user.getEmail()),
                user.getEmail(),
                user.getName()
        );
    }
}
