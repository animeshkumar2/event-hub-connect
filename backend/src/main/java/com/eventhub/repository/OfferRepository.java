package com.eventhub.repository;

import com.eventhub.model.Offer;
import com.eventhub.model.ChatThread;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    
    List<Offer> findByThreadOrderByCreatedAtDesc(ChatThread thread);
    
    List<Offer> findByListingOrderByCreatedAtDesc(Listing listing);
    
    List<Offer> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<Offer> findByVendorOrderByCreatedAtDesc(Vendor vendor);
    
    List<Offer> findByThreadAndStatus(ChatThread thread, Offer.OfferStatus status);
    
    @Query("SELECT o FROM Offer o WHERE o.thread.id = :threadId AND o.status IN ('pending', 'countered') ORDER BY o.createdAt DESC")
    List<Offer> findActiveOffersByThread(@Param("threadId") UUID threadId);
    
    @Query("SELECT o FROM Offer o WHERE o.thread.id = :threadId AND o.listing.id = :listingId AND o.status IN ('pending', 'countered') ORDER BY o.createdAt DESC")
    List<Offer> findActiveOffersByThreadAndListing(@Param("threadId") UUID threadId, @Param("listingId") UUID listingId);
    
    @Query("SELECT o FROM Offer o WHERE o.vendor.id = :vendorId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Offer> findByVendorAndStatus(@Param("vendorId") UUID vendorId, @Param("status") Offer.OfferStatus status);
    
    Optional<Offer> findByIdAndVendorId(UUID offerId, UUID vendorId);
    
    Optional<Offer> findByIdAndUserId(UUID offerId, UUID userId);
    
    List<Offer> findByLeadIdOrderByCreatedAtDesc(UUID leadId);
}



