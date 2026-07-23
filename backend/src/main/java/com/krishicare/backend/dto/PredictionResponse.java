package com.krishicare.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PredictionResponse(
        Long id,
        String imageUrl,
        String cropName,
        String diseaseName,
        String rawClass,
        Double confidence,
        String severity,
        String modelVersion,
        String advisory,
        LocalDateTime timestamp,
        List<TopPredictionDto> topPredictions,
        String heatmapBase64
) {}
