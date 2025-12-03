package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Lead;
import com.eventhub.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/leads")
@RequiredArgsConstructor
public class VendorLeadController {
    
    private final LeadService leadService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Lead>>> getVendorLeads(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<Lead> leads = leadService.getVendorLeads(vendorId);
        return ResponseEntity.ok(ApiResponse.success(leads));
    }
    
    @PutMapping("/{leadId}/status")
    public ResponseEntity<ApiResponse<Lead>> updateLeadStatus(
            @PathVariable UUID leadId,
            @RequestBody UpdateStatusRequest request) {
        Lead lead = leadService.updateLeadStatus(leadId, Lead.LeadStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Lead status updated", lead));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
}

