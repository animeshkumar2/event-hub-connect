package com.eventhub.dto.response;

import com.eventhub.model.Offer;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OfferDTO {
    private UUID id;
    private UUID threadId;
    private UUID listingId;
    private String listingName;
    private String listingImage;
    private UUID userId;
    private String userName;
    private UUID vendorId;
    private String vendorName;
    
    // Offer details
    private BigDecimal offeredPrice;
    private BigDecimal originalPrice;
    private BigDecimal customizedPrice; // Price after customization, before negotiation
    private String customization; // JSON string with customization details
    private String message;
    
    // Event details
    private String eventType;
    private LocalDate eventDate;
    private String eventTime;
    private String venueAddress;
    private Integer guestCount;
    
    // Status
    private Offer.OfferStatus status;
    
    // Counter offer
    private BigDecimal counterPrice;
    private String counterMessage;
    
    // References
    private UUID orderId;
    private UUID leadId;
    
    // Token payment details (populated when orderId exists)
    private BigDecimal tokenAmount;
    private boolean tokenPaid;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime expiredAt;
    
    public static OfferDTO fromEntity(Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setId(offer.getId());
        dto.setThreadId(offer.getThread().getId());
        dto.setListingId(offer.getListing().getId());
        dto.setListingName(offer.getListing().getName());
        if (offer.getListing().getImages() != null && !offer.getListing().getImages().isEmpty()) {
            dto.setListingImage(offer.getListing().getImages().get(0));
        }
        dto.setUserId(offer.getUserId());
        // Try to get user name from thread
        if (offer.getThread().getUser() != null) {
            dto.setUserName(offer.getThread().getUser().getFullName());
        }
        dto.setVendorId(offer.getVendor().getId());
        dto.setVendorName(offer.getVendor().getBusinessName());
        
        dto.setOfferedPrice(offer.getOfferedPrice());
        dto.setOriginalPrice(offer.getOriginalPrice());
        dto.setCustomizedPrice(offer.getCustomizedPrice());
        dto.setCustomization(offer.getCustomization());
        dto.setMessage(offer.getMessage());
        
        dto.setEventType(offer.getEventType());
        dto.setEventDate(offer.getEventDate());
        dto.setEventTime(offer.getEventTime());
        dto.setVenueAddress(offer.getVenueAddress());
        dto.setGuestCount(offer.getGuestCount());
        
        dto.setStatus(offer.getStatus());
        dto.setCounterPrice(offer.getCounterPrice());
        dto.setCounterMessage(offer.getCounterMessage());
        
        dto.setOrderId(offer.getOrderId());
        dto.setLeadId(offer.getLeadId());
        
        dto.setCreatedAt(offer.getCreatedAt());
        dto.setUpdatedAt(offer.getUpdatedAt());
        dto.setAcceptedAt(offer.getAcceptedAt());
        dto.setRejectedAt(offer.getRejectedAt());
        dto.setExpiredAt(offer.getExpiredAt());
        
        // Token payment fields need to be set from order - this is a placeholder
        // They'll be set by the service layer when fetching offers with order details
        
        return dto;
    }
    
    /**
     * Create OfferDTO with order token details
     */
    public static OfferDTO fromEntityWithOrderDetails(Offer offer, BigDecimal tokenAmount, boolean tokenPaid) {
        OfferDTO dto = fromEntity(offer);
        dto.setTokenAmount(tokenAmount);
        dto.setTokenPaid(tokenPaid);
        return dto;
    }
}

