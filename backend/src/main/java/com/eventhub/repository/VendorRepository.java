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
    
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true " +
           "AND (:categoryId IS NULL OR v.vendorCategory.id = :categoryId) " +
           "AND (:cityName IS NULL OR v.cityName = :cityName) " +
           "AND (:minPrice IS NULL OR v.startingPrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR v.startingPrice <= :maxPrice) " +
           "AND (:searchQuery IS NULL OR LOWER(v.businessName) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
           "OR LOWER(v.bio) LIKE LOWER(CONCAT('%', :searchQuery, '%')))")
    List<Vendor> searchVendors(
        @Param("categoryId") String categoryId,
        @Param("cityName") String cityName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("searchQuery") String searchQuery
    );
}

