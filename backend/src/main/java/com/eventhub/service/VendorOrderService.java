package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.model.Vendor;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorOrderService {
    
    private final OrderRepository orderRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public Page<Order> getVendorOrders(UUID vendorId, Order.OrderStatus status, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        if (status != null) {
            return orderRepository.findByVendorAndStatus(vendor, status, pageable);
        }
        
        return orderRepository.findByVendor(vendor, pageable);
    }
    
    @Transactional(readOnly = true)
    public Order getOrderById(UUID orderId, UUID vendorId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        
        if (!order.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to view this order");
        }
        
        return order;
    }
    
    public Order updateOrderStatus(UUID orderId, UUID vendorId, Order.OrderStatus status) {
        Order order = getOrderById(orderId, vendorId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    public Order confirmOrder(UUID orderId, UUID vendorId) {
        return updateOrderStatus(orderId, vendorId, Order.OrderStatus.CONFIRMED);
    }
    
    @Transactional(readOnly = true)
    public List<Order> getUpcomingOrders(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        LocalDate today = LocalDate.now();
        LocalDate threeMonthsLater = today.plusMonths(3);
        
        return orderRepository.findUpcomingOrders(vendor, today, threeMonthsLater);
    }
}




