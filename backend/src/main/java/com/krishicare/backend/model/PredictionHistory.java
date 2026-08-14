package com.krishicare.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_history", indexes = {
        @Index(name = "idx_prediction_timestamp", columnList = "timestamp"),
        @Index(name = "idx_prediction_session", columnList = "session_id"),
        @Index(name = "idx_prediction_user_id", columnList = "user_id")
})
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "crop_name", nullable = false)
    private String cropName;

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @Column(name = "raw_class", nullable = false)
    private String rawClass;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity;

    @Column(name = "model_version", nullable = false, length = 50)
    private String modelVersion;

    @Column(name = "advisory", length = 1000, nullable = false)
    private String advisory;

    @Column(name = "top_predictions", length = 2000)
    private String topPredictionsJson;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public PredictionHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getDiseaseName() { return diseaseName; }
    public void setDiseaseName(String diseaseName) { this.diseaseName = diseaseName; }

    public String getRawClass() { return rawClass; }
    public void setRawClass(String rawClass) { this.rawClass = rawClass; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getAdvisory() { return advisory; }
    public void setAdvisory(String advisory) { this.advisory = advisory; }

    public String getTopPredictionsJson() { return topPredictionsJson; }
    public void setTopPredictionsJson(String topPredictionsJson) { this.topPredictionsJson = topPredictionsJson; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
