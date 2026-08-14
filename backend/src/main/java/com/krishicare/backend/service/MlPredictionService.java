package com.krishicare.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class MlPredictionService {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestClient restClient;

    public MlPredictionService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);
        factory.setReadTimeout(60000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictCropDisease(MultipartFile file, boolean explain) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        
        builder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        }, MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "image/jpeg"));

        MultiValueMap<String, HttpEntity<?>> multipartBody = builder.build();

        int maxRetries = 5;
        int attempt = 0;
        while (true) {
            attempt++;
            try {
                return restClient.post()
                        .uri(mlServiceUrl + "/predict?explain=" + explain)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(multipartBody)
                        .retrieve()
                        .body(Map.class);
            } catch (Exception ex) {
                boolean isUnavailable = (ex instanceof HttpStatusCodeException httpEx && httpEx.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE);
                if (isUnavailable && attempt < maxRetries) {
                    try {
                        System.out.println("ML Service is loading model into memory... Retrying prediction (attempt " + attempt + "/" + maxRetries + ")");
                        Thread.sleep(2500);
                        continue;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Prediction interrupted while waiting for ML model startup", ie);
                    }
                }
                if (isUnavailable) {
                    throw new IllegalStateException("ML model is still waking up or not loaded. Please try again in a few seconds.");
                }
                if (ex instanceof org.springframework.web.client.ResourceAccessException) {
                    System.err.println("ML Service is unreachable at " + mlServiceUrl + ". Ensure python ML service is running (python ml-service/src/main.py).");
                    throw new IllegalStateException("ML microservice is offline. Please start the ML service on port 8000.", ex);
                }
                if (ex instanceof IOException ioEx) throw ioEx;
                throw new RuntimeException("Prediction request failed: " + ex.getMessage(), ex);
            }
        }
    }
}
