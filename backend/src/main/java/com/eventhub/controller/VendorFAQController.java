package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.VendorFAQ;
import com.eventhub.service.VendorFAQService;
import com.eventhub.util.VendorIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/faqs")
@RequiredArgsConstructor
public class VendorFAQController {
    
    private final VendorFAQService faqService;
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorFAQ>>> getFAQs(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<VendorFAQ> faqs = faqService.getFAQs(vendorId);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<VendorFAQ>> createFAQ(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody VendorFAQ faq) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorFAQ created = faqService.createFAQ(vendorId, faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ created", created));
    }
    
    @PutMapping("/{faqId}")
    public ResponseEntity<ApiResponse<VendorFAQ>> updateFAQ(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID faqId,
            @RequestBody VendorFAQ faq) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorFAQ updated = faqService.updateFAQ(faqId, vendorId, faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ updated", updated));
    }
    
    @DeleteMapping("/{faqId}")
    public ResponseEntity<ApiResponse<Void>> deleteFAQ(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID faqId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        faqService.deleteFAQ(faqId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted", null));
    }
}

