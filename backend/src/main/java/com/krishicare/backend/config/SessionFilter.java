package com.krishicare.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class SessionFilter extends OncePerRequestFilter {

    public static final String SESSION_HEADER = "X-Session-Id";
    public static final String SESSION_COOKIE = "krishi_session";
    public static final String SESSION_ATTR = "krishiSessionId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String sessionId = resolveSessionId(request);
        if (sessionId == null) {
            sessionId = UUID.randomUUID().toString();
            Cookie cookie = new Cookie(SESSION_COOKIE, sessionId);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(60 * 60 * 24 * 30);
            response.addCookie(cookie);
        }
        request.setAttribute(SESSION_ATTR, sessionId);
        response.setHeader(SESSION_HEADER, sessionId);
        filterChain.doFilter(request, response);
    }

    private String resolveSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (SESSION_COOKIE.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        String header = request.getHeader(SESSION_HEADER);
        return (header != null && !header.isBlank()) ? header : null;
    }
}
