package com.krishicare.backend.config;

import com.krishicare.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String USER_ID_ATTR = "krishiUserId";
    public static final String USER_EMAIL_ATTR = "krishiUserEmail";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.krishicare.backend.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parseToken(header.substring(7));
                if (jwtService.isAccessToken(claims)) {
                    Long userId = Long.parseLong(claims.getSubject());
                    if (userRepository.existsById(userId)) {
                        String email = claims.get("email", String.class);
                        request.setAttribute(USER_ID_ATTR, userId);
                        request.setAttribute(USER_EMAIL_ATTR, email);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(email, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception ignored) {
                // Invalid token — treat as guest
            }
        }
        filterChain.doFilter(request, response);
    }
}

