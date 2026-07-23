package com.krishicare.backend.config;

import com.krishicare.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String USER_ID_ATTR = "krishiUserId";
    public static final String USER_EMAIL_ATTR = "krishiUserEmail";

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parseToken(header.substring(7));
                if (jwtService.isAccessToken(claims)) {
                    request.setAttribute(USER_ID_ATTR, Long.parseLong(claims.getSubject()));
                    request.setAttribute(USER_EMAIL_ATTR, claims.get("email", String.class));
                }
            } catch (Exception ignored) {
                // Invalid token — treat as guest
            }
        }
        filterChain.doFilter(request, response);
    }
}
