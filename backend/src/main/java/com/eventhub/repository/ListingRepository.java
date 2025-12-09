package com.eventhub.repository;

import com.eventhub.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    
    List<Listing> findByIsActiveTrue();
    
    List<Listing> findByListingCategoryIdAndIsActiveTrue(String categoryId);
    
    List<Listing> findByTypeAndIsActiveTrue(Listing.ListingType type);
    
    @Query("SELECT DISTINCT l FROM Listing l " +
           "JOIN l.eventTypes et " +
           "WHERE l.isActive = true AND et.id = :eventTypeId")
    List<Listing> findByEventTypeId(@Param("eventTypeId") Integer eventTypeId);
    
    // Simple query without eventType - uses JPQL with fetch joins for performance
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.vendor v " +
           "LEFT JOIN FETCH l.listingCategory c " +
           "WHERE l.isActive = true " +
           "AND (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
           "ORDER BY l.isPopular DESC, l.isTrending DESC, l.createdAt DESC")
    List<Listing> findActiveListingsSimple(
        @Param("categoryId") String categoryId,
        @Param("type") Listing.ListingType type,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        org.springframework.data.domain.Pageable pageable
    );
    
    // Query with eventType - uses JPQL with fetch joins for performance
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.vendor v " +
           "LEFT JOIN FETCH l.listingCategory c " +
           "JOIN l.eventTypes et " +
           "WHERE l.isActive = true " +
           "AND et.id = :eventTypeId " +
           "AND (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
           "ORDER BY l.isPopular DESC, l.isTrending DESC, l.createdAt DESC")
    List<Listing> findByEventTypeWithFilters(
        @Param("eventTypeId") Integer eventTypeId,
        @Param("categoryId") String categoryId,
        @Param("type") Listing.ListingType type,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        org.springframework.data.domain.Pageable pageable
    );
    
    // Fetch eventTypes for a list of listings (batch load to avoid N+1)
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.eventTypes " +
           "WHERE l IN :listings")
    List<Listing> fetchEventTypes(@Param("listings") List<Listing> listings);
    
    List<Listing> findByVendorIdAndIsActiveTrue(UUID vendorId);
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isPopular = true")
    List<Listing> findPopularListings();
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isTrending = true")
    List<Listing> findTrendingListings();
    
    List<Listing> findByVendorIdAndTypeAndIsActiveTrue(UUID vendorId, Listing.ListingType type);
}

