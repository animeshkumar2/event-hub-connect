package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CounterOfferRequest;
import com.eventhub.dto.response.OfferDTO;
import com.eventhub.model.Offer;
import com.eventhub.model.Order;
import com.eventhub.repository.OrderRepository;
import com.eventhub.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/offers")
@RequiredArgsConstructor
public class VendorOfferController {
    
    private final OfferService offerService;
    private final OrderRepository orderRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getVendorOffers(
            @RequestHeader("X-Vendor-Id") UUID vendorId) {
        
        List<OfferDTO> offers = offerService.getVendorOffers(vendorId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
    
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getOffersByThread(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID threadId) {
        
        List<OfferDTO> offers = offerService.getOffersByThread(threadId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
    
    @GetMapping("/{offerId}")
    public ResponseEntity<ApiResponse<OfferDTO>> getOffer(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID offerId) {
        
        OfferDTO offer = offerService.getOfferById(offerId);
        return ResponseEntity.ok(ApiResponse.success(offer));
    }
    
    @PostMapping("/{offerId}/accept")
    public ResponseEntity<ApiResponse<OfferDTO>> acceptOffer(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID offerId) {
        
        Offer offer = offerService.acceptOffer(vendorId, offerId);
        
        // Get token amount from the created order
        BigDecimal tokenAmount = BigDecimal.ZERO;
        boolean tokenPaid = false;
        if (offer.getOrderId() != null) {
            Order order = orderRepository.findById(offer.getOrderId()).orElse(null);
            if (order != null) {
                tokenAmount = order.getTokenAmount() != null ? order.getTokenAmount() : BigDecimal.ZERO;
                tokenPaid = order.getTokenPaid() != null ? order.getTokenPaid().compareTo(BigDecimal.ZERO) > 0 : false;
            }
        }
        
        OfferDTO dto = OfferDTO.fromEntityWithOrderDetails(offer, tokenAmount, tokenPaid);
        return ResponseEntity.ok(ApiResponse.success("Offer accepted. Order created successfully", dto));
    }
    
    @PostMapping("/{offerId}/reject")
    public ResponseEntity<ApiResponse<OfferDTO>> rejectOffer(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID offerId) {
        
        Offer offer = offerService.rejectOffer(vendorId, offerId);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Offer rejected", dto));
    }
    
    @PostMapping("/{offerId}/counter")
    public ResponseEntity<ApiResponse<OfferDTO>> counterOffer(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID offerId,
            @Valid @RequestBody CounterOfferRequest request) {
        
        Offer offer = offerService.counterOffer(vendorId, offerId, request);
        OfferDTO dto = OfferDTO.fromEntity(offer);
        return ResponseEntity.ok(ApiResponse.success("Counter offer sent", dto));
    }
}



