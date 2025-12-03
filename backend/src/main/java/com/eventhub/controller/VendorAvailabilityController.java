package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.AvailabilitySlot;
import com.eventhub.service.VendorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/availability")
@RequiredArgsConstructor
public class VendorAvailabilityController {
    
    private final VendorAvailabilityService availabilityService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> getAvailability(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        List<AvailabilitySlot> slots = availabilityService.getAvailability(vendorId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> createAvailabilitySlots(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam LocalDate date,
            @RequestBody List<VendorAvailabilityService.TimeSlotRequest> timeSlots) {
        List<AvailabilitySlot> slots = availabilityService.createAvailabilitySlots(vendorId, date, timeSlots);
        return ResponseEntity.ok(ApiResponse.success("Availability slots created", slots));
    }
    
    @PutMapping("/{slotId}")
    public ResponseEntity<ApiResponse<AvailabilitySlot>> updateSlot(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID slotId,
            @RequestBody UpdateStatusRequest request) {
        AvailabilitySlot slot = availabilityService.updateSlot(
                slotId, vendorId, AvailabilitySlot.SlotStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Slot updated", slot));
    }
    
    @DeleteMapping("/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID slotId) {
        availabilityService.deleteSlot(slotId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted", null));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
}

