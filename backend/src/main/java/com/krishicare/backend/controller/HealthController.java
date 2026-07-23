package com.krishicare.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestClient restClient = RestClient.builder().build();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean mlReady = false;
        String mlStatus = "unreachable";

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> mlHealth = restClient.get()
                    .uri(mlServiceUrl + "/")
                    .retrieve()
                    .body(Map.class);
            if (mlHealth != null) {
                mlStatus = String.valueOf(mlHealth.getOrDefault("status", "unknown"));
                mlReady = Boolean.TRUE.equals(mlHealth.get("model_loaded"));
            }
        } catch (Exception ignored) {
            mlStatus = "unreachable";
        }

        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "KrishiCare Backend",
                "mlService", Map.of(
                        "status", mlStatus,
                        "modelLoaded", mlReady,
                        "url", mlServiceUrl
                )
        ));
    }
}
