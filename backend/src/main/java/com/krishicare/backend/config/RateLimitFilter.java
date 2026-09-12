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
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private long lastCleanupTime = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!uri.startsWith("/api/crop/predict")) {
            filterChain.doFilter(request, response);
            return;
        }

        cleanupStaleWindowsIfNeeded();

        String key = resolveClientIp(request);
        Window window = windows.computeIfAbsent(key, k -> new Window());
        if (!window.tryAcquire()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many prediction requests. Please wait a minute before analyzing more leaves.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupStaleWindowsIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanupTime > 120_000) { // Every 2 minutes
            lastCleanupTime = now;
            windows.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
        }
    }

    private static final class Window {
        private final AtomicLong resetAt = new AtomicLong(System.currentTimeMillis() + 60_000);
        private final AtomicInteger count = new AtomicInteger(0);

        boolean tryAcquire() {
            long now = System.currentTimeMillis();
            long currentReset = resetAt.get();
            if (now > currentReset) {
                if (resetAt.compareAndSet(currentReset, now + 60_000)) {
                    count.set(0);
                }
            }
            return count.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
        }

        boolean isExpired(long now) {
            return now > resetAt.get() + 60_000;
        }
    }
}

