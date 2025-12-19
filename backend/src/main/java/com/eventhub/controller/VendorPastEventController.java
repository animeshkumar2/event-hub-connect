package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.VendorPastEvent;
import com.eventhub.service.VendorPastEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/past-events")
@RequiredArgsConstructor
public class VendorPastEventController {
    
    private final VendorPastEventService pastEventService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorPastEvent>>> getPastEvents(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<VendorPastEvent> events = pastEventService.getPastEvents(vendorId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<VendorPastEvent>> addPastEvent(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestBody VendorPastEvent event) {
        VendorPastEvent created = pastEventService.addPastEvent(vendorId, event);
        return ResponseEntity.ok(ApiResponse.success("Past event added", created));
    }
    
    @DeleteMapping("/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deletePastEvent(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID eventId) {
        pastEventService.deletePastEvent(eventId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Past event deleted", null));
    }
}









