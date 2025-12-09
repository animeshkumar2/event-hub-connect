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
    
    @Query(value = "SELECT DISTINCT l.* FROM listings l " +
           "LEFT JOIN listing_event_types let ON l.id = let.listing_id " +
           "LEFT JOIN event_types et ON let.event_type_id = et.id " +
           "LEFT JOIN vendors v ON v.id = l.vendor_id " +
           "WHERE l.is_active = true " +
           "AND (:eventTypeId IS NULL OR et.id = :eventTypeId) " +
           "AND (:categoryId IS NULL OR l.listing_category_id = :categoryId) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "AND (:cityName IS NULL OR v.city_name = :cityName) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
           "AND (:searchQuery IS NULL OR LOWER(CAST(COALESCE(l.name, '') AS TEXT)) LIKE LOWER('%' || COALESCE(:searchQuery, '') || '%') " +
           "     OR LOWER(CAST(COALESCE(l.description, '') AS TEXT)) LIKE LOWER('%' || COALESCE(:searchQuery, '') || '%'))",
           nativeQuery = true)
    List<Listing> findWithFilters(
        @Param("eventTypeId") Integer eventTypeId,
        @Param("categoryId") String categoryId,
        @Param("type") String type,
        @Param("cityName") String cityName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("searchQuery") String searchQuery
    );
    
    List<Listing> findByVendorIdAndIsActiveTrue(UUID vendorId);
    
    // Strict filtering: Event Type → Category → Listing Type
    @Query(value = "SELECT DISTINCT l.* FROM listings l " +
           "JOIN listing_event_types let ON l.id = let.listing_id " +
           "JOIN event_types et ON let.event_type_id = et.id " +
           "JOIN categories c ON c.id = l.listing_category_id " +
           "LEFT JOIN vendors v ON v.id = l.vendor_id " +
           "WHERE l.is_active = true " +
           "AND et.id = :eventTypeId " +
           "AND c.id = ANY(string_to_array(:categoryIds, ',')) " +
           "AND (:listingType IS NULL OR l.type = :listingType) " +
           "AND (:categoryId IS NULL OR l.listing_category_id = :categoryId) " +
           "AND (:cityName IS NULL OR v.city_name = :cityName) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
           "AND (:searchQuery IS NULL OR LOWER(CAST(COALESCE(l.name, '') AS TEXT)) LIKE LOWER('%' || COALESCE(:searchQuery, '') || '%') " +
           "     OR LOWER(CAST(COALESCE(l.description, '') AS TEXT)) LIKE LOWER('%' || COALESCE(:searchQuery, '') || '%'))",
           nativeQuery = true)
    List<Listing> findWithStrictFilters(
        @Param("eventTypeId") Integer eventTypeId,
        @Param("categoryIds") String categoryIds, // Comma-separated string
        @Param("listingType") String listingType,
        @Param("categoryId") String categoryId,
        @Param("cityName") String cityName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("searchQuery") String searchQuery
    );
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isPopular = true")
    List<Listing> findPopularListings();
    
    @Query("SELECT l FROM Listing l WHERE l.isActive = true AND l.isTrending = true")
    List<Listing> findTrendingListings();
    
    List<Listing> findByVendorIdAndTypeAndIsActiveTrue(UUID vendorId, Listing.ListingType type);
}

