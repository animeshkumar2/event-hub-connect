package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.VendorFAQ;
import com.eventhub.service.VendorFAQService;
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
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorFAQ>>> getFAQs(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<VendorFAQ> faqs = faqService.getFAQs(vendorId);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<VendorFAQ>> createFAQ(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestBody VendorFAQ faq) {
        VendorFAQ created = faqService.createFAQ(vendorId, faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ created", created));
    }
    
    @PutMapping("/{faqId}")
    public ResponseEntity<ApiResponse<VendorFAQ>> updateFAQ(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID faqId,
            @RequestBody VendorFAQ faq) {
        VendorFAQ updated = faqService.updateFAQ(faqId, vendorId, faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ updated", updated));
    }
    
    @DeleteMapping("/{faqId}")
    public ResponseEntity<ApiResponse<Void>> deleteFAQ(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID faqId) {
        faqService.deleteFAQ(faqId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted", null));
    }
}

