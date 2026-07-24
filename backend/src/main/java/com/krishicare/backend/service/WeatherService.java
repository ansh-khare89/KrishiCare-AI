package com.krishicare.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${weather.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.builder().build();

    public String getWeatherAdvisory(String city) {
        if (city == null || city.isBlank()) {
            return "";
        }

        try {
            if (apiKey == null || apiKey.isBlank()) {
                System.out.println("Weather API key not configured, using mock data for city: " + city);
                return mockTip(city);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = restClient.get()
                    .uri("https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric",
                            city, apiKey)
                    .retrieve()
                    .body(Map.class);

            if (data == null) {
                System.out.println("Weather API returned null data for city: " + city);
                return mockTip(city);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> main = (Map<String, Object>) data.get("main");
            double humidity = main != null ? ((Number) main.get("humidity")).doubleValue() : 0;
            double temp = main != null ? ((Number) main.get("temp")).doubleValue() : 0;

            @SuppressWarnings("unchecked")
            var weatherList = (java.util.List<?>) data.get("weather");
            String condition = weatherList != null && !weatherList.isEmpty()
                    ? String.valueOf(((Map<?, ?>) weatherList.get(0)).get("main"))
                    : "Unknown";

            System.out.println("Weather data retrieved for " + city + ": " + condition + ", " + temp + "°C, " + humidity + "%");
            return buildTip(city, condition, temp, humidity);
        } catch (Exception e) {
            System.out.println("Weather API failed for city " + city + ": " + e.getMessage() + ", using mock data");
            return mockTip(city);
        }
    }

    private String mockTip(String city) {
        return "Weather note for " + city + ": Humid conditions favor fungal diseases. "
                + "Avoid evening irrigation and ensure good airflow between plants.";
    }

    private String buildTip(String city, String condition, double temp, double humidity) {
        StringBuilder tip = new StringBuilder("Weather in " + city + ": " + condition
                + ", " + String.format("%.0f", temp) + "°C, " + String.format("%.0f", humidity) + "% humidity. ");

        if (humidity > 75 || condition.toLowerCase().contains("rain")) {
            tip.append("High moisture — reduce leaf wetness and scout for blight daily.");
        } else if (temp > 32) {
            tip.append("Hot conditions — water early morning, avoid midday stress.");
        } else {
            tip.append("Conditions look moderate — continue regular scouting.");
        }
        return tip.toString();
    }
}
