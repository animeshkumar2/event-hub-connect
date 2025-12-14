package com.eventhub.repository;

import com.eventhub.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {
    
    @Query("SELECT COUNT(a) FROM AnalyticsEvent a WHERE a.eventType = :eventType")
    long countByEventType(@Param("eventType") AnalyticsEvent.EventType eventType);
    
    @Query("SELECT COUNT(a) FROM AnalyticsEvent a WHERE a.eventType = :eventType AND a.createdAt >= :startDate")
    long countByEventTypeSince(@Param("eventType") AnalyticsEvent.EventType eventType, 
                               @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(DISTINCT a.sessionId) FROM AnalyticsEvent a WHERE a.eventType = 'PAGE_VIEW' AND a.createdAt >= :startDate")
    long countUniqueVisitorsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(DISTINCT a.userId) FROM AnalyticsEvent a WHERE a.eventType IN ('SIGNUP', 'VENDOR_SIGNUP', 'CUSTOMER_SIGNUP') AND a.createdAt >= :startDate AND a.userId IS NOT NULL")
    long countUniqueSignupsSince(@Param("startDate") LocalDateTime startDate);
}

