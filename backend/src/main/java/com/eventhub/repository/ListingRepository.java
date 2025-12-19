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
    
    // Note: These methods are for admin/internal use - they don't filter drafts
    // For customer-facing queries, use findActiveListingsSimple or findByEventTypeWithFilters
    List<Listing> findByIsActiveTrue();
    
    List<Listing> findByListingCategoryIdAndIsActiveTrue(String categoryId);
    
    List<Listing> findByTypeAndIsActiveTrue(Listing.ListingType type);
    
    @Query("SELECT DISTINCT l FROM Listing l " +
           "JOIN l.eventTypes et " +
           "WHERE l.isActive = true " +
           "AND l.price > 0.01 " +
           "AND et.id = :eventTypeId")
    List<Listing> findByEventTypeId(@Param("eventTypeId") Integer eventTypeId);
    
    // Simple query without eventType - uses JPQL with fetch joins for performance
    // Excludes drafts: isActive must be true, price > 0.01 (draft marker)
    // Note: Image filtering is done in Java code since SIZE() doesn't work on PostgreSQL arrays
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.vendor v " +
           "LEFT JOIN FETCH l.listingCategory c " +
           "WHERE l.isActive = true " +
           "AND l.price > 0.01 " +
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
    // Excludes drafts: isActive must be true, price > 0.01 (draft marker)
    // Note: Image filtering is done in Java code since SIZE() doesn't work on PostgreSQL arrays
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.vendor v " +
           "LEFT JOIN FETCH l.listingCategory c " +
           "JOIN l.eventTypes et " +
           "WHERE l.isActive = true " +
           "AND l.price > 0.01 " +
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
    
    // Optimized query for vendor listings with JOIN FETCH to avoid N+1 queries
    // Excludes drafts: isActive must be true, price > 0.01 (draft marker)
    // Note: Image filtering is done in Java code since SIZE() doesn't work on PostgreSQL arrays
    @Query("SELECT DISTINCT l FROM Listing l " +
           "LEFT JOIN FETCH l.vendor v " +
           "LEFT JOIN FETCH l.listingCategory c " +
           "LEFT JOIN FETCH l.eventTypes " +
           "WHERE l.vendor.id = :vendorId " +
           "AND l.isActive = true " +
           "AND l.price > 0.01 " +
           "ORDER BY l.createdAt DESC")
    List<Listing> findByVendorIdOptimized(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true " +
           "AND l.price > 0.01 " +
           "AND l.isPopular = true")
    List<Listing> findPopularListings();
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true " +
           "AND l.price > 0.01 " +
           "AND l.isTrending = true")
    List<Listing> findTrendingListings();
    
    List<Listing> findByVendorIdAndTypeAndIsActiveTrue(UUID vendorId, Listing.ListingType type);
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.vendor.id = :vendorId AND l.isActive = true")
    long countByVendorIdAndIsActiveTrue(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.isActive = true")
    long countByIsActiveTrue();
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") java.time.LocalDateTime date);
    
    // Native query for category distribution - much faster than loading all listings
    @Query(value = "SELECT " +
           "COALESCE(" +
           "  CASE WHEN l.listing_category_id = 'other' AND l.custom_category_name IS NOT NULL AND l.custom_category_name != '' " +
           "    THEN l.custom_category_name " +
           "    ELSE COALESCE(c.name, l.custom_category_name, 'Other') " +
           "  END, " +
           "  'Other'" +
           ") as category, " +
           "COUNT(*) as count " +
           "FROM listings l " +
           "LEFT JOIN categories c ON l.listing_category_id = c.id " +
           "GROUP BY category",
           nativeQuery = true)
    List<Object[]> getListingsByCategoryNative();
}

