package com.eventhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        // Production domains
        config.addAllowedOrigin("https://cartevent.com");
        config.addAllowedOrigin("https://www.cartevent.com");

        // Local development
        config.addAllowedOrigin("http://localhost:8080");
        config.addAllowedOrigin("http://localhost:5173");

        // Mobile testing - allow any local network IP
        config.addAllowedOriginPattern("http://192.168.*:*");
        config.addAllowedOriginPattern("http://10.*:*");
        config.addAllowedOriginPattern("http://172.16.*:*");

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
