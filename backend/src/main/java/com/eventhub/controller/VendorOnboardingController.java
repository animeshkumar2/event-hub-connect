package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.VendorOnboardingRequest;
import com.eventhub.model.Vendor;
import com.eventhub.service.VendorOnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors/onboarding")
@RequiredArgsConstructor
public class VendorOnboardingController {
    
    private final VendorOnboardingService onboardingService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Vendor>> onboardVendor(@Valid @RequestBody VendorOnboardingRequest request) {
        Vendor vendor = onboardingService.onboardVendor(request);
        return ResponseEntity.ok(ApiResponse.success("Vendor profile created successfully", vendor));
    }
}




