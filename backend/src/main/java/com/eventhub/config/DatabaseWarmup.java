package com.eventhub.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Warms up database connections on startup and keeps them alive.
 * This prevents slow cold starts with Supabase free tier.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseWarmup {

    private final DataSource dataSource;

    /**
     * Warm up database connections when application starts.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmupOnStartup() {
        log.info("Warming up database connections...");
        try {
            // Get multiple connections to populate the pool
            for (int i = 0; i < 3; i++) {
                try (Connection conn = dataSource.getConnection()) {
                    // Execute a simple query to ensure connection is fully established
                    conn.createStatement().execute("SELECT 1");
                }
            }
            log.info("Database connection pool warmed up successfully");
        } catch (SQLException e) {
            log.warn("Failed to warm up database connections: {}", e.getMessage());
        }
    }

    /**
     * Keep connections alive every 4 minutes to prevent Supabase spin-down.
     */
    @Scheduled(fixedRate = 240000) // Every 4 minutes
    public void keepAlive() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            log.debug("Database keep-alive ping successful");
        } catch (SQLException e) {
            log.warn("Database keep-alive failed: {}", e.getMessage());
        }
    }
}

