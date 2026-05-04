package com.myreport.backend.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "success", true,
                "message", "MyReport backend is running",
                "health", "/api/health"
        );
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "success", true,
                "status", "UP"
        );
    }
}
