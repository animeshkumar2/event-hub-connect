package com.eventhub.repository;

import com.eventhub.model.Payment;
import com.eventhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByOrder(Order order);
    Payment findByTransactionId(String transactionId);
    List<Payment> findByUserId(UUID userId);
}











