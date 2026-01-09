package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CreateOfferRequest;
import com.eventhub.dto.request.CounterOfferRequest;
import com.eventhub.dto.response.OfferDTO;
import com.eventhub.model.Offer;
import com.eventhub.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/offers")
@RequiredArgsConstructor
public class OfferController {
    
    private final OfferService offerService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<OfferDTO>> createOffer(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateOfferRequest request) {
        
        Offer offer = offerService.createOffer(userId, request);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Offer created successfully", dto));
    }
    
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getOffersByThread(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID threadId) {
        
        List<OfferDTO> offers = offerService.getOffersByThread(threadId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
    
    @GetMapping("/my-offers")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getMyOffers(
            @RequestHeader("X-User-Id") UUID userId) {
        
        List<OfferDTO> offers = offerService.getUserOffers(userId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
    
    @GetMapping("/{offerId}")
    public ResponseEntity<ApiResponse<OfferDTO>> getOffer(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID offerId) {
        
        OfferDTO offer = offerService.getOfferById(offerId);
        return ResponseEntity.ok(ApiResponse.success(offer));
    }
    
    @PostMapping("/{offerId}/accept-counter")
    public ResponseEntity<ApiResponse<OfferDTO>> acceptCounterOffer(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID offerId) {
        
        Offer offer = offerService.acceptCounterOffer(userId, offerId);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Counter offer accepted. Order created successfully", dto));
    }
    
    @PostMapping("/{offerId}/counter")
    public ResponseEntity<ApiResponse<OfferDTO>> userCounterOffer(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID offerId,
            @Valid @RequestBody CounterOfferRequest request) {
        
        Offer offer = offerService.userCounterOffer(userId, offerId, request);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Counter offer sent", dto));
    }
    
    @PostMapping("/{offerId}/withdraw")
    public ResponseEntity<ApiResponse<OfferDTO>> withdrawOffer(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID offerId) {
        
        Offer offer = offerService.withdrawOffer(userId, offerId);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Offer withdrawn successfully", dto));
    }
}



