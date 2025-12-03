package com.eventhub.repository;

import com.eventhub.model.OrderAddOn;
import com.eventhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderAddOnRepository extends JpaRepository<OrderAddOn, OrderAddOn.OrderAddOnId> {
    List<OrderAddOn> findByOrder(Order order);
}

