package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.exception.ValidationException;
import com.eventhub.model.AvailabilitySlot;
import com.eventhub.service.VendorAvailabilityService;
import com.eventhub.util.VendorIdResolver;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
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
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String categoryId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<AvailabilitySlot> slots;
        
        if (categoryId != null && !categoryId.isEmpty()) {
            slots = availabilityService.getAvailabilityByCategory(vendorId, startDate, endDate, categoryId);
        } else {
            slots = availabilityService.getAvailability(vendorId, startDate, endDate);
        }
        
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
    
    @GetMapping("/day/{date}")
    public ResponseEntity<ApiResponse<List<AvailabilitySlot>>> getDayDetails(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable LocalDate date) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<AvailabilitySlot> slots = availabilityService.getDayDetails(vendorId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
    
    @GetMapping("/booking-counts")
    public ResponseEntity<ApiResponse<Map<String, Map<String, Long>>>> getBookingCounts(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Map<String, Map<String, Long>> counts = availabilityService.getBookingCountsByDateAndCategory(vendorId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(counts));
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
                AvailabilitySlot.SlotStatus.valueOf(request.getStatus()),
                request.getCategoryId(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success(
                updatedCount + " dates updated", updatedCount));
    }
    
    @PostMapping("/block-day")
    public ResponseEntity<ApiResponse<Integer>> blockDay(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BlockDayRequest request) {
        try {
            UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
            
            // Validate request
            if (request == null || request.getDate() == null) {
                throw new ValidationException("Date is required");
            }
            
            // Normalize categoryId - treat empty string as null
            String categoryId = request.getCategoryId();
            if (categoryId != null && categoryId.trim().isEmpty()) {
                categoryId = null;
            }
            
            int updatedCount = availabilityService.blockDayForCategory(
                    vendorId, request.getDate(), categoryId, request.getNotes());
            return ResponseEntity.ok(ApiResponse.success("Day blocked", updatedCount));
        } catch (Exception e) {
            log.error("Error blocking day for vendor: date={}, categoryId={}, error={}", 
                    request != null ? request.getDate() : "null",
                    request != null ? request.getCategoryId() : "null",
                    e.getMessage(), e);
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        }
    }
    
    @PostMapping("/unblock-day")
    public ResponseEntity<ApiResponse<Integer>> unblockDay(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BlockDayRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        int updatedCount = availabilityService.unblockDayForCategory(
                vendorId, request.getDate(), request.getCategoryId());
        return ResponseEntity.ok(ApiResponse.success("Day unblocked", updatedCount));
    }
    
    @PostMapping("/block-time-slot")
    public ResponseEntity<ApiResponse<Integer>> blockTimeSlot(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BlockTimeSlotRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        int updatedCount = availabilityService.blockTimeSlot(
                vendorId, request.getDate(), request.getTimeSlotType(), 
                request.getCategoryId(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success("Time slot blocked", updatedCount));
    }
    
    @PostMapping("/unblock-time-slot")
    public ResponseEntity<ApiResponse<Integer>> unblockTimeSlot(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BlockTimeSlotRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        int updatedCount = availabilityService.unblockTimeSlot(
                vendorId, request.getDate(), request.getTimeSlotType(), request.getCategoryId());
        return ResponseEntity.ok(ApiResponse.success("Time slot unblocked", updatedCount));
    }
    
    @PostMapping("/block-custom-time")
    public ResponseEntity<ApiResponse<Integer>> blockCustomTime(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody BlockCustomTimeRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        int updatedCount = availabilityService.blockCustomTimeRange(
                vendorId, request.getDate(), request.getFromTime(), request.getToTime(),
                request.getCategoryId(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success("Custom time range blocked", updatedCount));
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
    
    @PutMapping("/{slotId}/details")
    public ResponseEntity<ApiResponse<AvailabilitySlot>> updateSlotDetails(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID slotId,
            @RequestBody VendorAvailabilityService.SlotUpdateRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        AvailabilitySlot slot = availabilityService.updateSlotWithDetails(slotId, vendorId, request);
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
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        private String status;
        private String categoryId;
        private String notes;
    }
    
    @lombok.Data
    public static class BlockDayRequest {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;
        private String categoryId;
        private String notes;
    }
    
    @lombok.Data
    public static class BlockTimeSlotRequest {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;
        private String timeSlotType; // MORNING, AFTERNOON, EVENING, or custom
        private String categoryId;
        private String notes;
    }
    
    @lombok.Data
    public static class BlockCustomTimeRequest {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;
        private String fromTime; // HH:MM format
        private String toTime;   // HH:MM format
        private String categoryId;
        private String notes;
    }
}











