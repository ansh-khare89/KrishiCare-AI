package com.krishicare.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
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

    private final RestClient restClient = RestClient.builder().build();

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

        try {
            return restClient.post()
                    .uri(mlServiceUrl + "/predict?explain=" + explain)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(multipartBody)
                    .retrieve()
                    .body(Map.class);
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
                throw new IllegalStateException(
                        "ML model is not loaded. Train the model first (see ml-service/README.md).");
            }
            throw ex;
        }
    }
}
