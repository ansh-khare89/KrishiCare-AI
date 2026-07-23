package com.krishicare.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI krishiCareOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("KrishiCare API")
                        .description("Crop disease detection and advisory platform")
                        .version("1.0"));
    }
}
