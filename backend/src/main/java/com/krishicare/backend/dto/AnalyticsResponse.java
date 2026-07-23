package com.krishicare.backend.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        long totalScans,
        long healthyCount,
        long diseasedCount,
        Map<String, Long> byCrop,
        List<DiseaseCount> byDisease
) {
    public record DiseaseCount(String name, long count) {}
}
