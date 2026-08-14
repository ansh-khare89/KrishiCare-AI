package com.krishicare.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private static SimpleClientHttpRequestFactory createRequestFactory(int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return factory;
    }

    // Fast client for periodic health checks (10s timeout to allow local TF checks)
    private final RestClient healthClient = RestClient.builder()
            .requestFactory(createRequestFactory(10000))
            .build();

    // Dedicated client for wake-up pings (35s timeout for cold starts and local TF load)
    private final RestClient wakeUpClient = RestClient.builder()
            .requestFactory(createRequestFactory(35000))
            .build();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean mlReady = false;
        boolean mlLoading = false;
        String mlStatus = "unreachable";

        try {
            // Try ping endpoint first (lightweight check)
            @SuppressWarnings("unchecked")
            Map<String, Object> pingResponse = healthClient.get()
                    .uri(mlServiceUrl + "/ping")
                    .retrieve()
                    .body(Map.class);

            if (pingResponse != null && "pong".equals(pingResponse.get("status"))) {
                mlStatus = "healthy";
                // Check detailed ML health & model status
                @SuppressWarnings("unchecked")
                Map<String, Object> mlHealth = healthClient.get()
                        .uri(mlServiceUrl + "/")
                        .retrieve()
                        .body(Map.class);
                if (mlHealth != null) {
                    mlReady = Boolean.TRUE.equals(mlHealth.get("model_loaded"));
                    mlLoading = Boolean.TRUE.equals(mlHealth.get("model_loading"));
                }
            }
        } catch (Exception e) {
            mlStatus = "unreachable";
        }

        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "KrishiCare Backend",
                "mlService", Map.of(
                        "status", mlStatus,
                        "modelLoaded", mlReady,
                        "modelLoading", mlLoading,
                        "url", mlServiceUrl
                ),
                "message", mlReady ? "All systems operational" :
                           (mlLoading ? "ML model is loading into memory..." : "ML service sleeping or offline")
        ));
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "pong",
                "service", "KrishiCare Backend",
                "timestamp", java.time.Instant.now().toString()
        ));
    }

    @RequestMapping(value = "/ml/wakeup")
    public ResponseEntity<Map<String, Object>> wakeUpMlService() {
        boolean wokenUp = false;
        boolean modelLoaded = false;
        boolean modelLoading = false;
        String mlStatus = "unreachable";

        System.out.println("Initiating wake-up ping to ML Service at: " + mlServiceUrl);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> pingResponse = wakeUpClient.get()
                    .uri(mlServiceUrl + "/ping")
                    .retrieve()
                    .body(Map.class);

            if (pingResponse != null && "pong".equals(pingResponse.get("status"))) {
                wokenUp = true;
                mlStatus = "healthy";

                @SuppressWarnings("unchecked")
                Map<String, Object> mlHealth = wakeUpClient.get()
                        .uri(mlServiceUrl + "/")
                        .retrieve()
                        .body(Map.class);
                if (mlHealth != null) {
                    modelLoaded = Boolean.TRUE.equals(mlHealth.get("model_loaded"));
                    modelLoading = Boolean.TRUE.equals(mlHealth.get("model_loading"));
                }
            }
        } catch (Exception e) {
            System.err.println("ML Service Wake-up Ping Failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "success", wokenUp,
                "mlStatus", mlStatus,
                "modelLoaded", modelLoaded,
                "modelLoading", modelLoading,
                "message", wokenUp ? (modelLoaded ? "ML Service operational" : "ML Service waking up / loading model") : "Failed to reach ML Service"
        ));
    }
}

