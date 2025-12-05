package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.EventPlannerRequest;
import com.eventhub.dto.response.EventRecommendationDTO;
import com.eventhub.service.EventPlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/event-planner")
@RequiredArgsConstructor
public class PublicEventPlannerController {
    
    private final EventPlannerService eventPlannerService;
    
    @PostMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<EventRecommendationDTO>>> getRecommendations(
            @Valid @RequestBody EventPlannerRequest request) {
        
        List<EventRecommendationDTO> recommendations = eventPlannerService.generateRecommendations(
                request.getBudget(),
                request.getEventType(),
                request.getGuestCount()
        );
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}

