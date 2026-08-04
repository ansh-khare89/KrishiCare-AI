package com.krishicare.backend.controller;

import com.krishicare.backend.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@Tag(name = "Weather", description = "Weather agricultural advisory APIs")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping
    @Operation(summary = "Get weather-based agricultural tips for a specific city")
    public ResponseEntity<Map<String, Object>> getWeatherTip(@RequestParam(value = "city", defaultValue = "New Delhi") String city) {
        return ResponseEntity.ok(weatherService.getWeatherData(city));
    }
}
