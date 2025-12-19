package com.eventhub.service;

import com.eventhub.model.AnalyticsEvent;
import com.eventhub.repository.AnalyticsEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final AnalyticsEventRepository analyticsEventRepository;
    
    @Transactional
    public void trackPageView(HttpServletRequest request, UUID userId) {
        try {
            AnalyticsEvent event = new AnalyticsEvent();
            event.setEventType(AnalyticsEvent.EventType.PAGE_VIEW);
            event.setUserId(userId);
            event.setSessionId(getOrCreateSessionId(request));
            event.setPagePath(request.getRequestURI());
            event.setReferrer(request.getHeader("Referer"));
            event.setUserAgent(request.getHeader("User-Agent"));
            event.setIpAddress(getClientIpAddress(request));
            event.setDeviceType(detectDeviceType(request.getHeader("User-Agent")));
            
            analyticsEventRepository.save(event);
        } catch (Exception e) {
            log.error("Error tracking page view", e);
            // Don't throw - analytics shouldn't break the app
        }
    }
    
    @Transactional
    public void trackSignup(UUID userId, String userType) {
        try {
            AnalyticsEvent event = new AnalyticsEvent();
            event.setUserId(userId);
            event.setEventType(userType.equals("vendor") ? 
                AnalyticsEvent.EventType.VENDOR_SIGNUP : 
                AnalyticsEvent.EventType.CUSTOMER_SIGNUP);
            event.setPagePath("/auth");
            
            analyticsEventRepository.save(event);
        } catch (Exception e) {
            log.error("Error tracking signup", e);
        }
    }
    
    @Transactional
    public void trackLogin(UUID userId) {
        try {
            AnalyticsEvent event = new AnalyticsEvent();
            event.setUserId(userId);
            event.setEventType(AnalyticsEvent.EventType.LOGIN);
            event.setPagePath("/auth");
            
            analyticsEventRepository.save(event);
        } catch (Exception e) {
            log.error("Error tracking login", e);
        }
    }
    
    public long getTotalPageViews() {
        return analyticsEventRepository.countByEventType(AnalyticsEvent.EventType.PAGE_VIEW);
    }
    
    public long getTotalSignups() {
        return analyticsEventRepository.countByEventType(AnalyticsEvent.EventType.SIGNUP) +
               analyticsEventRepository.countByEventType(AnalyticsEvent.EventType.VENDOR_SIGNUP) +
               analyticsEventRepository.countByEventType(AnalyticsEvent.EventType.CUSTOMER_SIGNUP);
    }
    
    public long getPageViewsSince(LocalDateTime startDate) {
        return analyticsEventRepository.countByEventTypeSince(AnalyticsEvent.EventType.PAGE_VIEW, startDate);
    }
    
    public long getSignupsSince(LocalDateTime startDate) {
        return analyticsEventRepository.countByEventTypeSince(AnalyticsEvent.EventType.VENDOR_SIGNUP, startDate) +
               analyticsEventRepository.countByEventTypeSince(AnalyticsEvent.EventType.CUSTOMER_SIGNUP, startDate);
    }
    
    public long getUniqueVisitorsSince(LocalDateTime startDate) {
        return analyticsEventRepository.countUniqueVisitorsSince(startDate);
    }
    
    public long getUniqueSignupsSince(LocalDateTime startDate) {
        return analyticsEventRepository.countUniqueSignupsSince(startDate);
    }
    
    private String getOrCreateSessionId(HttpServletRequest request) {
        // In a real implementation, you'd use session management
        // For now, use a simple approach
        return request.getSession(true).getId();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    private String detectDeviceType(String userAgent) {
        if (userAgent == null) return "unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return "mobile";
        } else if (ua.contains("tablet") || ua.contains("ipad")) {
            return "tablet";
        }
        return "desktop";
    }
}





