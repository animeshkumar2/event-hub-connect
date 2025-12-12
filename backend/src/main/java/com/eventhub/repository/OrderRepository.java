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
    
    @Query("SELECT o FROM Order o WHERE o.vendor = :vendor AND o.eventDate >= :startDate AND o.eventDate <= :endDate")
    List<Order> findUpcomingOrders(@Param("vendor") Vendor vendor, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.vendor = :vendor AND o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Double calculateRevenue(@Param("vendor") Vendor vendor, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    Optional<Order> findByOrderNumber(String orderNumber);
}


