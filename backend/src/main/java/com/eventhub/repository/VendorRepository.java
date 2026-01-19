package com.eventhub.repository;

import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    
    List<Vendor> findByIsActiveTrue();
    
    List<Vendor> findByVendorCategoryIdAndIsActiveTrue(String categoryId);
    
    List<Vendor> findByCityNameAndIsActiveTrue(String cityName);
    
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true AND v.rating >= :minRating")
    List<Vendor> findByMinRating(@Param("minRating") BigDecimal minRating);
    
    List<Vendor> findByVendorCategoryIdAndCityNameAndIsActiveTrue(
        String categoryId, 
        String cityName
    );
    
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true AND v.isVerified = true " +
           "ORDER BY v.rating DESC, v.reviewCount DESC")
    List<Vendor> findFeaturedVendors();
    
    // Optimized JPQL query with pagination - much faster than native query
    @Query("SELECT v FROM Vendor v " +
           "LEFT JOIN FETCH v.vendorCategory " +
           "WHERE v.isActive = true " +
           "AND (:categoryId IS NULL OR v.vendorCategory.id = :categoryId) " +
           "AND (:cityName IS NULL OR v.cityName = :cityName) " +
           "AND (:minPrice IS NULL OR v.startingPrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR v.startingPrice <= :maxPrice) " +
           "ORDER BY v.isVerified DESC, v.rating DESC NULLS LAST")
    List<Vendor> searchVendorsOptimized(
        @Param("categoryId") String categoryId,
        @Param("cityName") String cityName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        org.springframework.data.domain.Pageable pageable
    );
    
    // Legacy native query (kept for compatibility)
    @Query(value = "SELECT * FROM vendors v WHERE v.is_active = true " +
           "AND (:categoryId IS NULL OR v.vendor_category_id = :categoryId) " +
           "AND (:cityName IS NULL OR v.city_name = :cityName) " +
           "AND (:minPrice IS NULL OR v.starting_price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR v.starting_price <= :maxPrice) " +
           "AND (:searchQuery IS NULL OR CAST(v.business_name AS TEXT) ILIKE '%' || :searchQuery || '%')",
           nativeQuery = true)
    List<Vendor> searchVendors(
        @Param("categoryId") String categoryId,
        @Param("cityName") String cityName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("searchQuery") String searchQuery
    );
    
    java.util.Optional<Vendor> findByUserId(UUID userId);
    
    // Optimized query for vendor profile with category pre-loaded
    @Query("SELECT v FROM Vendor v " +
           "LEFT JOIN FETCH v.vendorCategory " +
           "LEFT JOIN FETCH v.city " +
           "WHERE v.id = :vendorId")
    java.util.Optional<Vendor> findByIdWithDetails(@Param("vendorId") UUID vendorId);
    
    // Get first vendor (for admin testing) - efficient single row query
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true ORDER BY v.createdAt ASC")
    List<Vendor> findFirstActiveVendor(org.springframework.data.domain.Pageable pageable);
    
    // Optimized stats queries
    @Query("SELECT COUNT(v) FROM Vendor v WHERE v.isVerified = true")
    long countVerifiedVendors();
    
    @Query("SELECT AVG(v.rating) FROM Vendor v WHERE v.rating IS NOT NULL AND v.reviewCount > 0")
    Double getAverageRating();
    
    @Query("SELECT COUNT(v) FROM Vendor v WHERE v.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") java.time.LocalDateTime date);
    
    // Native query for city distribution - much faster than loading all vendors
    @Query(value = "SELECT city_name, COUNT(*) as count " +
           "FROM vendors " +
           "WHERE city_name IS NOT NULL " +
           "GROUP BY city_name",
           nativeQuery = true)
    List<Object[]> getVendorsByCityNative();
    
    // Optimized query for admin vendor list - using native query to avoid type casting issues
    // Native query properly handles null search parameter and type casting
    @Query(value = "SELECT DISTINCT v.* FROM vendors v " +
           "LEFT JOIN categories vc ON vc.id = v.vendor_category_id " +
           "WHERE (:search IS NULL OR CAST(v.business_name AS TEXT) ILIKE '%' || CAST(:search AS TEXT) || '%') " +
           "AND (:category IS NULL OR v.vendor_category_id = :category) " +
           "AND (:city IS NULL OR v.city_name = :city) " +
           "AND (:isVerified IS NULL OR v.is_verified = :isVerified) " +
           "AND (:isActive IS NULL OR v.is_active = :isActive) " +
           "ORDER BY v.created_at DESC",
           countQuery = "SELECT COUNT(DISTINCT v.id) FROM vendors v " +
           "LEFT JOIN categories vc ON vc.id = v.vendor_category_id " +
           "WHERE (:search IS NULL OR CAST(v.business_name AS TEXT) ILIKE '%' || CAST(:search AS TEXT) || '%') " +
           "AND (:category IS NULL OR v.vendor_category_id = :category) " +
           "AND (:city IS NULL OR v.city_name = :city) " +
           "AND (:isVerified IS NULL OR v.is_verified = :isVerified) " +
           "AND (:isActive IS NULL OR v.is_active = :isActive)",
           nativeQuery = true)
    org.springframework.data.domain.Page<Vendor> findAllWithFilters(
        @Param("search") String search,
        @Param("category") String category,
        @Param("city") String city,
        @Param("isVerified") Boolean isVerified,
        @Param("isActive") Boolean isActive,
        org.springframework.data.domain.Pageable pageable
    );
}

