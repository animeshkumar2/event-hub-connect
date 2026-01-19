package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.AvailabilitySlot;
import com.eventhub.service.VendorAvailabilityService;
import com.eventhub.util.VendorIdResolver;
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
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> getAvailability(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<AvailabilitySlot> slots = availabilityService.getAvailability(vendorId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> createAvailabilitySlots(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam LocalDate date,
            @RequestBody List<VendorAvailabilityService.TimeSlotRequest> timeSlots) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<AvailabilitySlot> slots = availabilityService.createAvailabilitySlots(vendorId, date, timeSlots);
        return ResponseEntity.ok(ApiResponse.success("Availability slots created", slots));
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Integer>> bulkUpdateAvailability(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BulkUpdateRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        int updatedCount = availabilityService.bulkUpdateAvailability(
                vendorId, request.getStartDate(), request.getEndDate(), 
                AvailabilitySlot.SlotStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success(
                updatedCount + " dates updated", updatedCount));
    }
    
    @PutMapping("/{slotId}")
    public ResponseEntity<ApiResponse<AvailabilitySlot>> updateSlot(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID slotId,
            @RequestBody UpdateStatusRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        AvailabilitySlot slot = availabilityService.updateSlot(
                slotId, vendorId, AvailabilitySlot.SlotStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Slot updated", slot));
    }
    
    @DeleteMapping("/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID slotId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        availabilityService.deleteSlot(slotId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted", null));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
    
    @lombok.Data
    public static class BulkUpdateRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
    }
}











