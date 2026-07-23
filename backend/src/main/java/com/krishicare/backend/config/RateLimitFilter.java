package com.krishicare.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 20;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/api/crop/predict")) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getRemoteAddr();
        Window window = windows.computeIfAbsent(key, k -> new Window());
        if (!window.tryAcquire()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please wait a minute.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static final class Window {
        private long resetAt = System.currentTimeMillis() + 60_000;
        private final AtomicInteger count = new AtomicInteger(0);

        boolean tryAcquire() {
            long now = System.currentTimeMillis();
            if (now > resetAt) {
                resetAt = now + 60_000;
                count.set(0);
            }
            return count.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
        }
    }
}
