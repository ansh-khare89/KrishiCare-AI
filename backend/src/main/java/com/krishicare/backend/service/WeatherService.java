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

        // 1. If OpenWeatherMap API Key is configured, try OpenWeatherMap
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = restClient.get()
                        .uri("https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric",
                                city, apiKey)
                        .retrieve()
                        .body(Map.class);

                if (data != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> main = (Map<String, Object>) data.get("main");
                    double humidity = main != null ? ((Number) main.get("humidity")).doubleValue() : 0;
                    double temp = main != null ? ((Number) main.get("temp")).doubleValue() : 0;

                    var weatherList = (java.util.List<?>) data.get("weather");
                    String condition = weatherList != null && !weatherList.isEmpty()
                            ? String.valueOf(((Map<?, ?>) weatherList.get(0)).get("main"))
                            : "Clear";

                    return buildWeatherResult(city, condition, temp, humidity);
                }
            } catch (Exception e) {
                System.out.println("OpenWeatherMap call failed: " + e.getMessage() + ". Falling back to Open-Meteo.");
            }
        }

        // 2. Fallback to Open-Meteo (Free Real-Time Weather API — No API Key Required)
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> geoData = restClient.get()
                    .uri("https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1", city)
                    .retrieve()
                    .body(Map.class);

            if (geoData != null && geoData.get("results") instanceof java.util.List<?> results && !results.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> firstResult = (Map<String, Object>) results.get(0);
                double lat = ((Number) firstResult.get("latitude")).doubleValue();
                double lon = ((Number) firstResult.get("longitude")).doubleValue();

                @SuppressWarnings("unchecked")
                Map<String, Object> weatherData = restClient.get()
                        .uri("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code",
                                lat, lon)
                        .retrieve()
                        .body(Map.class);

                if (weatherData != null && weatherData.get("current") instanceof Map<?, ?> current) {
                    double temp = ((Number) current.get("temperature_2m")).doubleValue();
                    double humidity = ((Number) current.get("relative_humidity_2m")).doubleValue();
                    int weatherCode = ((Number) current.get("weather_code")).intValue();
                    String condition = mapWmoWeatherCode(weatherCode);

                    System.out.println("Live Open-Meteo weather retrieved for " + city + ": " + condition + ", " + temp + "°C, " + humidity + "%");
                    return buildWeatherResult(city, condition, temp, humidity);
                }
            }
        } catch (Exception e) {
            System.out.println("Open-Meteo call failed for " + city + ": " + e.getMessage() + ". Using simulated fallback.");
        }

        // 3. Deterministic Mock Fallback (Offline mode)
        return mockData(city);
    }

    private String mapWmoWeatherCode(int code) {
        if (code == 0) return "Clear";
        if (code >= 1 && code <= 3) return "Partly Cloudy";
        if (code >= 45 && code <= 48) return "Foggy";
        if (code >= 51 && code <= 67) return "Rainy";
        if (code >= 71 && code <= 77) return "Snowy";
        if (code >= 80 && code <= 82) return "Showers";
        if (code >= 95) return "Thunderstorm";
        return "Clear";
    }

    private Map<String, Object> buildWeatherResult(String city, String condition, double temp, double humidity) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("city", city);
        result.put("advisory", buildTip(city, condition, temp, humidity));
        result.put("temperature", String.format("%.0f°C", temp));
        result.put("humidity", String.format("%.0f%%", humidity));
        result.put("condition", condition);
        return result;
    }

    private Map<String, Object> mockData(String city) {
        int hash = Math.abs(city.toLowerCase().hashCode());
        int temp = 18 + (hash % 22);           // 18–39 °C range
        int humidity = 40 + (hash / 7 % 50);   // 40–89 % range

        String[] conditions = {"Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Hazy", "Clear"};
        String condition = conditions[hash % conditions.length];

        return buildWeatherResult(city, condition, temp, humidity);
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
