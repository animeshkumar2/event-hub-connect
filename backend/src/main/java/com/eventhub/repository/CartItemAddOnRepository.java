package com.eventhub.repository;

import com.eventhub.model.CartItem;
import com.eventhub.model.CartItemAddOn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartItemAddOnRepository extends JpaRepository<CartItemAddOn, UUID> {
    List<CartItemAddOn> findByCartItem(CartItem cartItem);
    List<CartItemAddOn> findByCartItemId(UUID cartItemId);
    void deleteByCartItem(CartItem cartItem);
}

