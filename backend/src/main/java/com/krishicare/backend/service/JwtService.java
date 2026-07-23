package com.krishicare.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpiryMs;
    private final long refreshExpiryMs;

    public JwtService(
            @Value("${jwt.secret:krishicare-dev-secret-change-in-production-32chars}") String secret,
            @Value("${jwt.access-expiry-hours:24}") long accessHours,
            @Value("${jwt.refresh-expiry-days:7}") long refreshDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiryMs = accessHours * 60 * 60 * 1000;
        this.refreshExpiryMs = refreshDays * 24 * 60 * 60 * 1000;
    }

    public String generateAccessToken(Long userId, String email) {
        return buildToken(userId, email, accessExpiryMs, "access");
    }

    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, refreshExpiryMs, "refresh");
    }

    private String buildToken(Long userId, String email, long expiryMs, String type) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("type", type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiryMs))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public boolean isAccessToken(Claims claims) {
        return "access".equals(claims.get("type"));
    }

    public boolean isRefreshToken(Claims claims) {
        return "refresh".equals(claims.get("type"));
    }
}
