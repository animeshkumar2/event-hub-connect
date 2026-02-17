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
            // Get 2 connections to populate the pool (don't exhaust the small pool)
            for (int i = 0; i < 2; i++) {
                try (Connection conn = dataSource.getConnection()) {
                    conn.createStatement().execute("SELECT 1");
                    log.debug("Database connection {} established successfully", i + 1);
                } catch (SQLException e) {
                    log.error("Failed to establish connection {} during warmup | SQL State: {} | Error Code: {} | Message: {}",
                            i + 1, e.getSQLState(), e.getErrorCode(), e.getMessage());
                    // Don't re-throw - let app start even if warmup partially fails
                    break;
                }
            }
            log.info("Database connection pool warmed up successfully");
        } catch (Exception e) {
            log.error("Unexpected error during database warmup | Type: {} | Message: {}",
                    e.getClass().getName(), e.getMessage());
        }
    }

    /**
     * Keep connections alive every 5 minutes.
     * HikariCP's built-in keepalive-time (60s) handles actual connection validation.
     * This is just a safety net to ensure the pool stays healthy.
     */
    @Scheduled(fixedRate = 300000, initialDelay = 60000) // Every 5 min, start after 1 min
    public void keepAlive() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            log.debug("Database keep-alive ping successful");
        } catch (SQLException e) {
            String errorDetails = buildSqlExceptionDetails(e);
            log.warn("Database keep-alive failed | {}", errorDetails);
        } catch (Exception e) {
            log.warn("Keep-alive error: {}", e.getMessage());
        }
    }

    /**
     * Build detailed error information from SQLException.
     */
    private String buildSqlExceptionDetails(SQLException e) {
        StringBuilder details = new StringBuilder();
        details.append("SQL State: ").append(e.getSQLState() != null ? e.getSQLState() : "N/A");
        details.append(" | Error Code: ").append(e.getErrorCode());
        details.append(" | Message: ").append(e.getMessage());

        Throwable cause = e.getCause();
        if (cause != null) {
            details.append(" | Cause: ").append(cause.getClass().getSimpleName());
            if (cause.getMessage() != null) {
                details.append(" - ").append(cause.getMessage());
            }
        }

        SQLException next = e.getNextException();
        if (next != null) {
            details.append(" | Next Exception: ").append(next.getMessage());
        }

        return details.toString();
    }
}











