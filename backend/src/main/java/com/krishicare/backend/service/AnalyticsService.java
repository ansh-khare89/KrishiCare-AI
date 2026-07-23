package com.krishicare.backend.service;

import com.krishicare.backend.dto.AnalyticsResponse;
import com.krishicare.backend.dto.AnalyticsResponse.DiseaseCount;
import com.krishicare.backend.repository.PredictionHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private PredictionHistoryRepository repository;

    public AnalyticsResponse getSessionAnalytics(String sessionId) {
        long total = repository.countBySessionId(sessionId);
        long healthy = repository.countHealthyBySessionId(sessionId);

        Map<String, Long> byCrop = new HashMap<>();
        for (Object[] row : repository.countByCropForSession(sessionId)) {
            byCrop.put((String) row[0], (Long) row[1]);
        }

        List<DiseaseCount> byDisease = repository.countByDiseaseForSession(sessionId).stream()
                .map(row -> new DiseaseCount((String) row[0], (Long) row[1]))
                .toList();

        return new AnalyticsResponse(total, healthy, total - healthy, byCrop, byDisease);
    }
}
