package com.krishicare.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishicare.backend.dto.PagedResponse;
import com.krishicare.backend.dto.PredictionResponse;
import com.krishicare.backend.dto.TopPredictionDto;
import com.krishicare.backend.mapper.PredictionMapper;
import com.krishicare.backend.model.PredictionHistory;
import com.krishicare.backend.repository.PredictionHistoryRepository;
import com.krishicare.backend.util.SeverityEstimator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private MlPredictionService mlPredictionService;

    @Autowired
    private AdvisoryService advisoryService;

    @Autowired
    private PredictionHistoryRepository repository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PredictionResponse processPrediction(MultipartFile file, String sessionId, boolean explain) throws IOException {
        String imageUrl = imageStorageService.uploadImage(file);

        Map<String, Object> predictionResult = mlPredictionService.predictCropDisease(file, explain);

        String rawClass = (String) predictionResult.get("class");
        String readableClass = (String) predictionResult.get("readable_class");
        Double confidence = parseConfidence(predictionResult.get("confidence"));
        String modelVersion = String.valueOf(predictionResult.getOrDefault("model_version", "unknown"));

        String cropName = resolveCropName(rawClass);
        String advisory = advisoryService.generateAdvisory(rawClass);
        String severity = SeverityEstimator.estimate(rawClass, confidence);
        List<TopPredictionDto> topPredictions = parseTopPredictions(predictionResult.get("top_predictions"));

        PredictionHistory history = new PredictionHistory();
        history.setSessionId(sessionId);
        history.setImageUrl(imageUrl);
        history.setCropName(cropName);
        history.setDiseaseName(readableClass);
        history.setRawClass(rawClass);
        history.setConfidence(confidence);
        history.setSeverity(severity);
        history.setModelVersion(modelVersion);
        history.setAdvisory(advisory);
        history.setTopPredictionsJson(objectMapper.writeValueAsString(topPredictions));
        history.setTimestamp(LocalDateTime.now());

        String heatmap = explain ? (String) predictionResult.get("heatmap_base64") : null;
        return PredictionMapper.toResponse(repository.save(history), heatmap);
    }

    public PagedResponse<PredictionResponse> getPredictionHistory(String sessionId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Page<PredictionHistory> result = repository.findBySessionIdOrderByTimestampDesc(
                sessionId,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "timestamp"))
        );

        List<PredictionResponse> content = result.getContent().stream()
                .map(PredictionMapper::toResponse)
                .toList();

        return new PagedResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    private String resolveCropName(String rawClass) {
        if (rawClass == null) return "Unknown";
        
        // Extract crop name from class name (format: "Crop___disease" or "Crop___healthy")
        String[] parts = rawClass.split("___");
        if (parts.length > 0) {
            String cropName = parts[0].trim();
            // Clean up special characters and format nicely
            cropName = cropName.replace("_", " ")
                               .replace("(maize)", "Corn")
                               .replace("(including_sour)", "")
                               .replace(",_bell", "")
                               .trim();
            // Capitalize first letter of each word
            String[] words = cropName.split("\\s+");
            StringBuilder formatted = new StringBuilder();
            for (String word : words) {
                if (!word.isEmpty()) {
                    formatted.append(Character.toUpperCase(word.charAt(0)))
                            .append(word.substring(1).toLowerCase())
                            .append(" ");
                }
            }
            return formatted.toString().trim();
        }
        return "Unknown";
    }

    @SuppressWarnings("unchecked")
    private List<TopPredictionDto> parseTopPredictions(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return List.of();
        }
        return list.stream()
                .filter(Map.class::isInstance)
                .map(item -> {
                    Map<String, Object> map = (Map<String, Object>) item;
                    return new TopPredictionDto(
                            String.valueOf(map.getOrDefault("readable_class", "")),
                            String.valueOf(map.getOrDefault("class", "")),
                            parseConfidence(map.get("confidence"))
                    );
                })
                .toList();
    }

    private Double parseConfidence(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number number) return number.doubleValue();
        return Double.parseDouble(value.toString());
    }
}
