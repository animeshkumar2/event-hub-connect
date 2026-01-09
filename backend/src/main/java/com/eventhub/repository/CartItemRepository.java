package com.eventhub.repository;

import com.eventhub.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUserId(UUID userId);
    
    @Query("SELECT SUM(c.finalPrice * c.quantity) FROM CartItem c WHERE c.userId = :userId")
    BigDecimal calculateCartTotal(@Param("userId") UUID userId);
    
    void deleteByUserId(UUID userId);
    
    List<CartItem> findByUserIdAndVendorId(UUID userId, UUID vendorId);
}











