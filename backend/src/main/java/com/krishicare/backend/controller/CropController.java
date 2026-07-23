package com.krishicare.backend.controller;

import com.krishicare.backend.config.SessionFilter;
import com.krishicare.backend.dto.AnalyticsResponse;
import com.krishicare.backend.dto.PredictionResponse;
import com.krishicare.backend.service.AnalyticsService;
import com.krishicare.backend.service.PredictionService;
import com.krishicare.backend.util.ImageValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/crop")
@Tag(name = "Crop", description = "Crop disease prediction APIs")
public class CropController {

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping("/predict")
    @Operation(summary = "Analyze a leaf image and return disease prediction")
    public ResponseEntity<PredictionResponse> predictCropHealth(
            @RequestParam("image") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean explain,
            HttpServletRequest request) throws IOException {
        ImageValidator.validate(file);
        String sessionId = (String) request.getAttribute(SessionFilter.SESSION_ATTR);
        return ResponseEntity.ok(predictionService.processPrediction(file, sessionId, explain));
    }

    @PostMapping("/predict/batch")
    @Operation(summary = "Analyze multiple leaf images")
    public ResponseEntity<List<PredictionResponse>> batchPredict(
            @RequestParam("images") List<MultipartFile> images,
            HttpServletRequest request) throws IOException {
        String sessionId = (String) request.getAttribute(SessionFilter.SESSION_ATTR);
        List<PredictionResponse> results = new ArrayList<>();
        for (MultipartFile file : images) {
            ImageValidator.validate(file);
            results.add(predictionService.processPrediction(file, sessionId, false));
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/history")
    @Operation(summary = "Get paginated prediction history for current session")
    public ResponseEntity<?> getHistoryLog(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        String sessionId = (String) request.getAttribute(SessionFilter.SESSION_ATTR);
        return ResponseEntity.ok(predictionService.getPredictionHistory(sessionId, page, size));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Dashboard stats for current session")
    public ResponseEntity<AnalyticsResponse> getAnalytics(HttpServletRequest request) {
        String sessionId = (String) request.getAttribute(SessionFilter.SESSION_ATTR);
        return ResponseEntity.ok(analyticsService.getSessionAnalytics(sessionId));
    }
}
