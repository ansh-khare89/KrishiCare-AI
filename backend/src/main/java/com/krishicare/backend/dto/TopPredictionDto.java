package com.krishicare.backend.dto;

public record TopPredictionDto(
        String diseaseName,
        String rawClass,
        Double confidence
) {}
