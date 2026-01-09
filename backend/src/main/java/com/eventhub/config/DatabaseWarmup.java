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
                    log.debug("Database connection {} established successfully", i + 1);
                } catch (SQLException e) {
                    log.error("Failed to establish connection {} during warmup | SQL State: {} | Error Code: {} | Message: {}", 
                            i + 1,
                            e.getSQLState(),
                            e.getErrorCode(),
                            e.getMessage(),
                            e);
                    throw e; // Re-throw to be caught by outer catch
                }
            }
            log.info("Database connection pool warmed up successfully");
        } catch (SQLException e) {
            String errorDetails = buildSqlExceptionDetails(e);
            log.error("Failed to warm up database connections | {}", errorDetails, e);
        } catch (Exception e) {
            log.error("Unexpected error during database warmup | Type: {} | Message: {}", 
                    e.getClass().getName(),
                    e.getMessage(),
                    e);
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
            String errorDetails = buildSqlExceptionDetails(e);
            log.warn("Database keep-alive failed | {}", errorDetails);
            log.debug("Database keep-alive SQLException stack trace:", e);
        } catch (Exception e) {
            log.error("Unexpected error during database keep-alive | Type: {} | Message: {}", 
                    e.getClass().getName(),
                    e.getMessage(),
                    e);
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
        
        // Add cause information if available
        Throwable cause = e.getCause();
        if (cause != null) {
            details.append(" | Cause: ").append(cause.getClass().getSimpleName());
            if (cause.getMessage() != null) {
                details.append(" - ").append(cause.getMessage());
            }
        }
        
        // Chain SQL exceptions if present
        SQLException next = e.getNextException();
        if (next != null) {
            details.append(" | Next Exception: ").append(next.getMessage());
        }
        
        return details.toString();
    }
}










