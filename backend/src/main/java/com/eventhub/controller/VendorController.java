package com.eventhub.controller;

import com.eventhub.dto.VendorDTO;
import com.eventhub.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {
    
    private final VendorService vendorService;
    
    @GetMapping
    public ResponseEntity<com.eventhub.dto.ApiResponse<List<com.eventhub.dto.VendorDTO>>> getAllVendors(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String city,
        @RequestParam(required = false) BigDecimal minRating
    ) {
        List<com.eventhub.dto.VendorDTO> vendors = vendorService.getAllVendors(category, city, minRating);
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(vendors));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<com.eventhub.dto.ApiResponse<com.eventhub.dto.VendorDTO>> getVendorById(@PathVariable UUID id) {
        com.eventhub.dto.VendorDTO vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(vendor));
    }
    
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<com.eventhub.dto.ApiResponse<com.eventhub.dto.VendorDTO>> getVendorByUserId(@PathVariable UUID userId) {
        com.eventhub.dto.VendorDTO vendor = vendorService.getVendorByUserId(userId);
        return ResponseEntity.ok(com.eventhub.dto.ApiResponse.success(vendor));
    }
}

