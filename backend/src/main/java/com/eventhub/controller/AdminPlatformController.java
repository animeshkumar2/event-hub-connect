package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.StatsDTO;
import com.eventhub.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/platform")
@RequiredArgsConstructor
public class AdminPlatformController {
    
    private final StatsService statsService;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsDTO>> getPlatformStats() {
        StatsDTO stats = statsService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}









