package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.response.LeadAcceptanceResponse;
import com.eventhub.dto.response.OfferDTO;
import com.eventhub.model.Lead;
import com.eventhub.model.Order;
import com.eventhub.service.LeadService;
import com.eventhub.service.OfferService;
import com.eventhub.util.VendorIdResolver;
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
    private final OfferService offerService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Lead>>> getVendorLeads(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<Lead> leads = leadService.getVendorLeads(vendorId);
        return ResponseEntity.ok(ApiResponse.success(leads));
    }
    
    @GetMapping("/{leadId}")
    public ResponseEntity<ApiResponse<Lead>> getLeadDetails(
            @PathVariable UUID leadId,
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Lead lead = leadService.getLeadById(leadId, vendorId);
        return ResponseEntity.ok(ApiResponse.success(lead));
    }
    
    @GetMapping("/{leadId}/offers")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getLeadOffers(
            @PathVariable UUID leadId) {
        List<OfferDTO> offers = offerService.getOffersByLeadId(leadId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
    
    @PutMapping("/{leadId}/status")
    public ResponseEntity<ApiResponse<Lead>> updateLeadStatus(
            @PathVariable UUID leadId,
            @RequestBody UpdateStatusRequest request) {
        Lead lead = leadService.updateLeadStatus(leadId, Lead.LeadStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Lead status updated", lead));
    }
    
    /**
     * Accept a lead - confirms the associated order
     */
    @PostMapping("/{leadId}/accept")
    public ResponseEntity<ApiResponse<LeadAcceptanceResponse>> acceptLead(
            @PathVariable UUID leadId,
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        LeadAcceptanceResponse response = leadService.acceptLead(leadId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Lead accepted successfully", response));
    }
    
    /**
     * Reject a lead - initiates refund if token was paid
     */
    @PostMapping("/{leadId}/reject")
    public ResponseEntity<ApiResponse<Lead>> rejectLead(
            @PathVariable UUID leadId,
            @RequestBody(required = false) RejectLeadRequest request,
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        String reason = request != null && request.getReason() != null ? request.getReason() : "Vendor declined";
        Lead lead = leadService.rejectLead(leadId, vendorId, reason);
        return ResponseEntity.ok(ApiResponse.success("Lead rejected successfully", lead));
    }
    
    @lombok.Data
    public static class UpdateStatusRequest {
        private String status;
    }
    
    @lombok.Data
    public static class RejectLeadRequest {
        private String reason;
    }
}

