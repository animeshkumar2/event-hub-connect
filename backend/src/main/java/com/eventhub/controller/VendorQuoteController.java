package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Quote;
import com.eventhub.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/leads")
@RequiredArgsConstructor
public class VendorQuoteController {
    
    private final QuoteService quoteService;
    
    @PostMapping("/{leadId}/quotes")
    public ResponseEntity<ApiResponse<Quote>> createQuote(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID leadId,
            @RequestBody Quote quote) {
        Quote created = quoteService.createQuote(leadId, vendorId, quote);
        return ResponseEntity.ok(ApiResponse.success("Quote created", created));
    }
    
    @PutMapping("/{leadId}/quotes/{quoteId}")
    public ResponseEntity<ApiResponse<Quote>> updateQuote(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID quoteId,
            @RequestBody Quote quote) {
        Quote updated = quoteService.updateQuote(quoteId, vendorId, quote);
        return ResponseEntity.ok(ApiResponse.success("Quote updated", updated));
    }
    
    @DeleteMapping("/{leadId}/quotes/{quoteId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuote(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID quoteId) {
        quoteService.deleteQuote(quoteId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Quote deleted", null));
    }
    
    @GetMapping("/{leadId}/quotes")
    public ResponseEntity<ApiResponse<List<Quote>>> getLeadQuotes(@PathVariable UUID leadId) {
        List<Quote> quotes = quoteService.getLeadQuotes(leadId);
        return ResponseEntity.ok(ApiResponse.success(quotes));
    }
}

