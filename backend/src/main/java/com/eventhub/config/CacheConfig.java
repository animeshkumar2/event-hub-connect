package com.eventhub.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            "platformStats",           // Legacy - keep for backward compatibility
            "publicPlatformStats",     // Public stats cache
            "adminDashboardStats",     // Admin dashboard stats cache
            "vendorDetails"            // Vendor details cache
        );
        // Set TTL to 5 minutes for platform stats (refresh every 5 min)
        cacheManager.setAllowNullValues(false);
        return cacheManager;
    }
    
    // Evict public platform stats cache every 5 minutes to keep data fresh
    @Scheduled(fixedRate = 300000) // 5 minutes
    @CacheEvict(value = "publicPlatformStats", allEntries = true)
    public void evictPublicPlatformStatsCache() {
        // Cache eviction handled by annotation
    }
    
    // Evict admin dashboard stats cache every 5 minutes to keep data fresh
    @Scheduled(fixedRate = 300000) // 5 minutes
    @CacheEvict(value = "adminDashboardStats", allEntries = true)
    public void evictAdminDashboardStatsCache() {
        // Cache eviction handled by annotation
    }
}








