package com.myreport.backend.config;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.frontend-origin:http://localhost:3004}")
    private String frontendOrigin;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/api/payments/payu/**", payuCallbackCorsConfiguration());
        source.registerCorsConfiguration("/**", frontendCorsConfiguration());

        return source;
    }

    private CorsConfiguration frontendCorsConfiguration() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(frontendOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(true);
        return configuration;
    }

    private CorsConfiguration payuCallbackCorsConfiguration() {
        CorsConfiguration configuration = frontendCorsConfiguration();
        List<String> origins = new ArrayList<>(configuration.getAllowedOriginPatterns());
        origins.addAll(List.of(
                "null",
                "https://test.payu.in",
                "https://secure.payu.in",
                "https://*.payu.in"));
        configuration.setAllowedOriginPatterns(origins);
        return configuration;
    }

    private List<String> frontendOrigins() {
        Set<String> origins = new LinkedHashSet<>();
        if (frontendOrigin != null) {
            for (String origin : frontendOrigin.split(",")) {
                String value = origin.trim();
                if (!value.isBlank()) {
                    origins.add(value);
                }
            }
        }
        origins.add("http://localhost:*");
        origins.add("http://127.0.0.1:*");
        return new ArrayList<>(origins);
    }
}
