package com.eventhub.repository;

import com.eventhub.model.OrderTimeline;
import com.eventhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderTimelineRepository extends JpaRepository<OrderTimeline, UUID> {
    List<OrderTimeline> findByOrderOrderByCreatedAtAsc(Order order);
}




