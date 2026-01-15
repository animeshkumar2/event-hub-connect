package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingLifecycleService {
    
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    
    /**
     * Update booking statuses based on event dates
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void updateBookingStatuses() {
        log.info("Running scheduled booking status update");
        
        LocalDate today = LocalDate.now();
        
        // Find confirmed bookings with event date = today and update to IN_PROGRESS
        List<Order> todayBookings = orderRepository.findByStatusAndEventDate(
                Order.OrderStatus.CONFIRMED, today);
        
        for (Order order : todayBookings) {
            order.setStatus(Order.OrderStatus.IN_PROGRESS);
            orderRepository.save(order);
            log.info("Order {} status updated to IN_PROGRESS (event date: {})", 
                    order.getId(), order.getEventDate());
        }
        
        log.info("Updated {} bookings to IN_PROGRESS", todayBookings.size());
    }
    
    /**
     * Send reminders to vendors to complete events
     * Runs daily at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // Daily at 9 AM
    @Transactional(readOnly = true)
    public void sendCompletionReminders() {
        log.info("Running scheduled completion reminders");
        
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        // Find IN_PROGRESS bookings with event date = yesterday
        List<Order> completionPending = orderRepository.findByStatusAndEventDate(
                Order.OrderStatus.IN_PROGRESS, yesterday);
        
        for (Order order : completionPending) {
            try {
                notificationService.notifyVendorCompleteEvent(order);
                log.info("Sent completion reminder for order {}", order.getId());
            } catch (Exception e) {
                log.error("Failed to send completion reminder for order {}: {}", 
                        order.getId(), e.getMessage());
            }
        }
        
        log.info("Sent {} completion reminders", completionPending.size());
    }
    
    /**
     * Send reminders for upcoming events (7 days away)
     * Runs daily at 10 AM
     */
    @Scheduled(cron = "0 0 10 * * *") // Daily at 10 AM
    @Transactional(readOnly = true)
    public void sendUpcomingReminders() {
        log.info("Running scheduled upcoming event reminders");
        
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);
        
        // Find confirmed bookings with event date = 7 days from now
        List<Order> upcomingBookings = orderRepository.findByStatusAndEventDate(
                Order.OrderStatus.CONFIRMED, sevenDaysFromNow);
        
        for (Order order : upcomingBookings) {
            try {
                notificationService.notifyVendorUpcomingEvent(order, 7);
                notificationService.notifyUserUpcomingEvent(order, 7);
                log.info("Sent upcoming reminder for order {}", order.getId());
            } catch (Exception e) {
                log.error("Failed to send upcoming reminder for order {}: {}", 
                        order.getId(), e.getMessage());
            }
        }
        
        log.info("Sent {} upcoming event reminders", upcomingBookings.size());
    }
    
    /**
     * Send reminders for overdue completions (IN_PROGRESS > 7 days after event)
     * Runs daily at 11 AM
     */
    @Scheduled(cron = "0 0 11 * * *") // Daily at 11 AM
    @Transactional(readOnly = true)
    public void sendOverdueCompletionReminders() {
        log.info("Running scheduled overdue completion reminders");
        
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        
        // Find IN_PROGRESS bookings with event date > 7 days ago
        List<Order> overdueBookings = orderRepository.findOverdueInProgressOrders(sevenDaysAgo);
        
        for (Order order : overdueBookings) {
            try {
                notificationService.notifyVendorCompleteEvent(order);
                log.info("Sent overdue completion reminder for order {}", order.getId());
            } catch (Exception e) {
                log.error("Failed to send overdue reminder for order {}: {}", 
                        order.getId(), e.getMessage());
            }
        }
        
        log.info("Sent {} overdue completion reminders", overdueBookings.size());
    }
    
    /**
     * Auto-transition statuses for completed events
     * Can be called manually or scheduled
     */
    @Transactional
    public void autoTransitionStatuses() {
        log.info("Running auto status transition");
        
        // Update CONFIRMED -> IN_PROGRESS for today's events
        updateBookingStatuses();
        
        // Auto-complete events that are 30 days past event date
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Order> oldInProgressOrders = orderRepository.findOverdueInProgressOrders(thirtyDaysAgo);
        
        for (Order order : oldInProgressOrders) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);
            log.info("Auto-completed order {} (event date: {})", 
                    order.getId(), order.getEventDate());
        }
        
        log.info("Auto-completed {} old orders", oldInProgressOrders.size());
    }
    
    /**
     * Cancel expired pending token payments
     * Runs every 6 hours
     */
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    @Transactional
    public void cancelExpiredPendingPayments() {
        log.info("Running expired pending payment cancellation");
        
        // Find orders awaiting token payment for more than 24 hours
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        List<Order> expiredOrders = orderRepository.findExpiredPendingTokenPayments(cutoffTime);
        
        for (Order order : expiredOrders) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            order.setAwaitingTokenPayment(false);
            orderRepository.save(order);
            log.info("Cancelled expired order {} (created: {})", 
                    order.getId(), order.getCreatedAt());
        }
        
        log.info("Cancelled {} expired pending orders", expiredOrders.size());
    }
}
