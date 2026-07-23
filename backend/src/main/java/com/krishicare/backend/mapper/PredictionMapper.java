package com.krishicare.backend.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishicare.backend.dto.PredictionResponse;
import com.krishicare.backend.dto.TopPredictionDto;
import com.krishicare.backend.model.PredictionHistory;
import java.util.Collections;
import java.util.List;

public final class PredictionMapper {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private PredictionMapper() {}

    public static PredictionResponse toResponse(PredictionHistory entity) {
        return toResponse(entity, null);
    }

    public static PredictionResponse toResponse(PredictionHistory entity, String heatmapBase64) {
        return new PredictionResponse(
                entity.getId(),
                entity.getImageUrl(),
                entity.getCropName(),
                entity.getDiseaseName(),
                entity.getRawClass(),
                entity.getConfidence(),
                entity.getSeverity(),
                entity.getModelVersion(),
                entity.getAdvisory(),
                entity.getTimestamp(),
                parseTopPredictions(entity.getTopPredictionsJson()),
                heatmapBase64
        );
    }

    private static List<TopPredictionDto> parseTopPredictions(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<List<TopPredictionDto>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
