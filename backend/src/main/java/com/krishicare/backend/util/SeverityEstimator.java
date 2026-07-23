package com.krishicare.backend.util;

public final class SeverityEstimator {

    private SeverityEstimator() {}

    public static String estimate(String rawClass, double confidence) {
        if (rawClass == null) return "Unknown";

        String lower = rawClass.toLowerCase();
        if (lower.contains("healthy")) {
            return "None";
        }
        if (lower.contains("late_blight")) {
            return confidence >= 70 ? "High" : "Moderate";
        }
        if (lower.contains("early_blight")) {
            return confidence >= 75 ? "Moderate" : "Low";
        }
        return confidence >= 80 ? "Moderate" : "Low";
    }
}
