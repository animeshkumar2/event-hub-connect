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
}

