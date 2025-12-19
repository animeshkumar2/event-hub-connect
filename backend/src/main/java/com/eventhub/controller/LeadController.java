package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CreateLeadRequest;
import com.eventhub.model.Lead;
import com.eventhub.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/leads")
@RequiredArgsConstructor
public class LeadController {
    
    private final LeadService leadService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Lead>> createLead(@Valid @RequestBody CreateLeadRequest request) {
        Lead lead = leadService.createLead(request);
        return ResponseEntity.ok(ApiResponse.success("Lead submitted successfully", lead));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Lead>>> getCustomerLeads(@RequestHeader("X-User-Id") UUID userId) {
        List<Lead> leads = leadService.getCustomerLeads(userId);
        return ResponseEntity.ok(ApiResponse.success(leads));
    }
}









