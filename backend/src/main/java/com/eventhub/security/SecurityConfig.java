package com.eventhub.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Allow all OPTIONS requests (CORS preflight) - MUST be first
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // WebSocket endpoints - public (authentication handled at WebSocket level)
                .requestMatchers("/ws/**").permitAll()
                // Public endpoints
                .requestMatchers("/api/public/**").permitAll()
                // Auth endpoints - public
                .requestMatchers("/api/auth/**").permitAll()
                // Allow authenticated users to check if they have a vendor profile (must come before /api/vendors/**)
                .requestMatchers("/api/vendors/by-user/**").authenticated()
                // Vendor onboarding - accessible to authenticated users (they become vendors after onboarding)
                .requestMatchers("/api/vendors/onboarding/**").authenticated()
                // Customer endpoints - require authentication
                .requestMatchers("/api/customers/**").authenticated()
                // Vendor endpoints - require vendor role (more specific patterns must come first)
                .requestMatchers("/api/vendors/**").hasRole("VENDOR")
                // Admin endpoints - require admin role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow ALL origins for now to debug - will restrict later
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

