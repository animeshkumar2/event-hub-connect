package com.eventhub.repository;

import com.eventhub.model.OrderTimeline;
import com.eventhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderTimelineRepository extends JpaRepository<OrderTimeline, UUID> {
    List<OrderTimeline> findByOrderOrderByCreatedAtAsc(Order order);
    
    // Optimized query using order ID directly to avoid loading the full Order entity
    @Query("SELECT t FROM OrderTimeline t WHERE t.order.id = :orderId ORDER BY t.createdAt ASC")
    List<OrderTimeline> findByOrderIdOrderByCreatedAtAsc(@Param("orderId") UUID orderId);
}











