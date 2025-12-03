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
    
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN l.eventTypes et " +
           "WHERE l.isActive = true " +
           "AND (:eventTypeId IS NULL OR et.id = :eventTypeId) " +
           "AND (:categoryId IS NULL OR l.listingCategory.id = :categoryId) " +
           "AND (:type IS NULL OR l.type = :type)")
    List<Listing> findWithFilters(
        @Param("eventTypeId") Integer eventTypeId,
        @Param("categoryId") String categoryId,
        @Param("type") Listing.ListingType type
    );
    
    List<Listing> findByVendorIdAndIsActiveTrue(UUID vendorId);
    
    // Strict filtering: Event Type → Category → Listing Type
    @Query("SELECT DISTINCT l FROM Listing l " +
           "JOIN l.eventTypes et " +
           "JOIN l.listingCategory c " +
           "WHERE l.isActive = true " +
           "AND et.id = :eventTypeId " +
           "AND c.id IN :categoryIds " +
           "AND (:listingType IS NULL OR l.type = :listingType) " +
           "AND (:categoryId IS NULL OR l.listingCategory.id = :categoryId) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice)")
    List<Listing> findWithStrictFilters(
        @Param("eventTypeId") Integer eventTypeId,
        @Param("categoryIds") List<String> categoryIds,
        @Param("listingType") Listing.ListingType listingType,
        @Param("categoryId") String categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isPopular = true")
    List<Listing> findPopularListings();
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isTrending = true")
    List<Listing> findTrendingListings();
    
    List<Listing> findByVendorIdAndTypeAndIsActiveTrue(UUID vendorId, Listing.ListingType type);
}

