package com.krishicare.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${weather.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.builder().build();

    public Map<String, Object> getWeatherData(String city) {
        if (city == null || city.isBlank()) {
            return Map.of("city", "", "advisory", "", "temperature", "--", "humidity", "--", "condition", "--");
        }

        try {
            if (apiKey == null || apiKey.isBlank()) {
                System.out.println("Weather API key not configured, using mock data for city: " + city);
                return mockData(city);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = restClient.get()
                    .uri("https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric",
                            city, apiKey)
                    .retrieve()
                    .body(Map.class);

            if (data == null) {
                System.out.println("Weather API returned null data for city: " + city);
                return mockData(city);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> main = (Map<String, Object>) data.get("main");
            double humidity = main != null ? ((Number) main.get("humidity")).doubleValue() : 0;
            double temp = main != null ? ((Number) main.get("temp")).doubleValue() : 0;

            var weatherList = (java.util.List<?>) data.get("weather");
            String condition = weatherList != null && !weatherList.isEmpty()
                    ? String.valueOf(((Map<?, ?>) weatherList.get(0)).get("main"))
                    : "Unknown";

            System.out.println("Weather data retrieved for " + city + ": " + condition + ", " + temp + "°C, " + humidity + "%");

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("city", city);
            result.put("advisory", buildTip(city, condition, temp, humidity));
            result.put("temperature", String.format("%.0f°C", temp));
            result.put("humidity", String.format("%.0f%%", humidity));
            result.put("condition", condition);
            return result;
        } catch (Exception e) {
            System.out.println("Weather API failed for city " + city + ": " + e.getMessage() + ", using mock data");
            return mockData(city);
        }
    }

    private Map<String, Object> mockData(String city) {
        // Generate deterministic per-city variation so different cities show different values
        int hash = Math.abs(city.toLowerCase().hashCode());
        int temp = 18 + (hash % 22);           // 18–39 °C range
        int humidity = 40 + (hash / 7 % 50);   // 40–89 % range

        String[] conditions = {"Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Hazy", "Clear"};
        String condition = conditions[hash % conditions.length];

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("city", city);
        result.put("advisory", buildTip(city, condition, temp, humidity));
        result.put("temperature", temp + "°C");
        result.put("humidity", humidity + "%");
        result.put("condition", condition);
        return result;
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
