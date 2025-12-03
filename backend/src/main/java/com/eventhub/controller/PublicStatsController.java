package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.StatsDTO;
import com.eventhub.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/stats")
@RequiredArgsConstructor
public class PublicStatsController {
    
    private final StatsService statsService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<StatsDTO>> getStats() {
        StatsDTO stats = statsService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

