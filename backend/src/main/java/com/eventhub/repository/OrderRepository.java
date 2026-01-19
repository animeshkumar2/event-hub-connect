package com.eventhub.repository;

import com.eventhub.model.Order;
import com.eventhub.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserId(UUID userId, Pageable pageable);
    Page<Order> findByVendor(Vendor vendor, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.vendor = :vendor AND o.status = :status")
    Page<Order> findByVendorAndStatus(@Param("vendor") Vendor vendor, @Param("status") Order.OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Order o " +
           "WHERE o.vendor = :vendor AND o.eventDate >= :startDate AND o.eventDate <= :endDate " +
           "ORDER BY o.eventDate ASC")
    List<Order> findUpcomingOrders(@Param("vendor") Vendor vendor, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Optimized query for upcoming orders - no JOIN FETCH, simpler query
    @Query("SELECT o FROM Order o " +
           "WHERE o.vendor.id = :vendorId AND o.eventDate >= :startDate AND o.eventDate <= :endDate " +
           "ORDER BY o.eventDate ASC")
    List<Order> findUpcomingOrdersOptimized(
        @Param("vendorId") UUID vendorId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.vendor = :vendor AND o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Double calculateRevenue(@Param("vendor") Vendor vendor, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // Optimized stats query
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED'")
    long countCompletedOrders();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    java.math.BigDecimal calculateTotalRevenue();
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :date")
    java.math.BigDecimal calculateRevenueSince(@Param("date") java.time.LocalDateTime date);
    
    // Optimized queries for vendor stats
    @Query("SELECT COUNT(o) FROM Order o WHERE o.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.vendor.id = :vendorId AND o.status = :status")
    long countByVendorIdAndStatus(@Param("vendorId") UUID vendorId, @Param("status") Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.vendor.id = :vendorId AND o.status = 'COMPLETED'")
    java.math.BigDecimal calculateTotalRevenueByVendor(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.vendor.id = :vendorId AND o.status = 'COMPLETED' AND o.createdAt >= :date")
    java.math.BigDecimal calculateRevenueByVendorSince(@Param("vendorId") UUID vendorId, @Param("date") java.time.LocalDateTime date);
    
    // Token payment related queries
    List<Order> findByUserIdAndAwaitingTokenPayment(UUID userId, Boolean awaitingTokenPayment);
    
    @Query("SELECT o FROM Order o WHERE o.awaitingTokenPayment = true AND o.createdAt < :cutoffTime")
    List<Order> findExpiredPendingTokenPayments(@Param("cutoffTime") java.time.LocalDateTime cutoffTime);
    
    List<Order> findByUserId(UUID userId);
    
    // Booking lifecycle queries
    List<Order> findByStatusAndEventDate(Order.OrderStatus status, java.time.LocalDate eventDate);
    
    @Query("SELECT o FROM Order o WHERE o.status = 'IN_PROGRESS' AND o.eventDate < :cutoffDate")
    List<Order> findOverdueInProgressOrders(@Param("cutoffDate") java.time.LocalDate cutoffDate);
    
    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' AND o.eventDate BETWEEN :startDate AND :endDate")
    List<Order> findConfirmedOrdersBetweenDates(@Param("startDate") java.time.LocalDate startDate, 
                                                 @Param("endDate") java.time.LocalDate endDate);
    
    // Find bookings by vendor and status list (for filtering confirmed bookings only)
    Page<Order> findByVendorAndStatusIn(Vendor vendor, List<Order.OrderStatus> statuses, Pageable pageable);
    
    // Optimized count query for upcoming bookings
    @Query("SELECT COUNT(o) FROM Order o WHERE o.vendor.id = :vendorId AND o.eventDate > :today AND o.status IN :statuses")
    long countUpcomingBookings(@Param("vendorId") UUID vendorId, @Param("today") LocalDate today, @Param("statuses") List<Order.OrderStatus> statuses);
    
    // Optimized query for upcoming bookings - no JOIN FETCH
    @Query("SELECT o FROM Order o " +
           "WHERE o.vendor.id = :vendorId " +
           "AND o.status IN :statuses " +
           "AND (o.eventDate IS NULL OR o.eventDate >= :today) " +
           "ORDER BY o.eventDate ASC NULLS LAST")
    List<Order> findUpcomingBookingsOptimized(
        @Param("vendorId") UUID vendorId, 
        @Param("today") LocalDate today, 
        @Param("statuses") List<Order.OrderStatus> statuses,
        Pageable pageable
    );
    
    // Optimized query for past bookings - no JOIN FETCH
    @Query("SELECT o FROM Order o " +
           "WHERE o.vendor.id = :vendorId " +
           "AND (o.status = 'COMPLETED' OR (o.eventDate IS NOT NULL AND o.eventDate < :today)) " +
           "ORDER BY o.eventDate DESC NULLS LAST")
    List<Order> findPastBookingsOptimized(
        @Param("vendorId") UUID vendorId, 
        @Param("today") LocalDate today,
        Pageable pageable
    );
}




