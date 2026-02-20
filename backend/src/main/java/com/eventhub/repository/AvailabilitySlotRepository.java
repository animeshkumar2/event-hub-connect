package com.eventhub.repository;

import com.eventhub.model.AvailabilitySlot;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {
    List<AvailabilitySlot> findByVendorAndDateBetween(Vendor vendor, LocalDate startDate, LocalDate endDate);
    
    // Optimized query using vendor ID directly to avoid loading the full Vendor entity
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor.id = :vendorId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date ASC, a.timeSlot ASC")
    List<AvailabilitySlot> findByVendorIdAndDateBetween(
        @Param("vendorId") UUID vendorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Query with category filter
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor.id = :vendorId AND a.date BETWEEN :startDate AND :endDate AND (a.categoryId = :categoryId OR a.categoryId IS NULL) ORDER BY a.date ASC, a.timeSlot ASC")
    List<AvailabilitySlot> findByVendorIdAndDateBetweenAndCategory(
        @Param("vendorId") UUID vendorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("categoryId") String categoryId
    );
    
    // Query for specific category only (not including null)
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor.id = :vendorId AND a.date BETWEEN :startDate AND :endDate AND a.categoryId = :categoryId ORDER BY a.date ASC, a.timeSlot ASC")
    List<AvailabilitySlot> findByVendorIdAndDateBetweenAndCategoryIdExact(
        @Param("vendorId") UUID vendorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("categoryId") String categoryId
    );
    
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor = :vendor AND a.date = :date AND a.timeSlot = :timeSlot")
    Optional<AvailabilitySlot> findByVendorAndDateAndTimeSlot(
        @Param("vendor") Vendor vendor,
        @Param("date") LocalDate date,
        @Param("timeSlot") String timeSlot
    );
    
    // Find by vendor, date, time slot, and category
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor = :vendor AND a.date = :date AND a.timeSlot = :timeSlot AND (a.categoryId = :categoryId OR (:categoryId IS NULL AND a.categoryId IS NULL))")
    Optional<AvailabilitySlot> findByVendorAndDateAndTimeSlotAndCategory(
        @Param("vendor") Vendor vendor,
        @Param("date") LocalDate date,
        @Param("timeSlot") String timeSlot,
        @Param("categoryId") String categoryId
    );
    
    List<AvailabilitySlot> findByVendorAndDateAndStatus(Vendor vendor, LocalDate date, AvailabilitySlot.SlotStatus status);
    
    // Find all slots for a specific date (for day detail panel)
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor.id = :vendorId AND a.date = :date ORDER BY a.categoryId ASC, a.timeSlot ASC")
    List<AvailabilitySlot> findByVendorIdAndDate(
        @Param("vendorId") UUID vendorId,
        @Param("date") LocalDate date
    );
    
    // Count bookings per category for a date range (for calendar badges)
    @Query("SELECT a.date, a.categoryId, COUNT(a) FROM AvailabilitySlot a WHERE a.vendor.id = :vendorId AND a.date BETWEEN :startDate AND :endDate AND a.status = 'BOOKED' GROUP BY a.date, a.categoryId")
    List<Object[]> countBookingsByDateAndCategory(
        @Param("vendorId") UUID vendorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Find slots linked to an order
    List<AvailabilitySlot> findByOrderId(UUID orderId);
}











