package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_add_ons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(OrderAddOnId.class)
public class OrderAddOn {
    @Id
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Id
    @ManyToOne
    @JoinColumn(name = "add_on_id", nullable = false)
    private AddOn addOn;
    
    @Column(nullable = false)
    private Integer quantity = 1;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Snapshot price at time of order
}

