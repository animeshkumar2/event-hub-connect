package com.eventhub.config;

import com.eventhub.dto.request.RegisterRequest;
import com.eventhub.repository.UserProfileRepository;
import com.eventhub.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Creates a test customer account on startup for development/testing.
 * The email test@cartevent.com is in the TESTER_EMAILS list in PreLaunchContext,
 * so this user automatically bypasses the pre-launch gate.
 *
 * Credentials:
 *   Email: test@cartevent.com
 *   Phone: 9876501234
 *   Password: Test@123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer {

    private final UserProfileRepository userProfileRepository;
    private final AuthService authService;

    private static final String TEST_EMAIL = "test@cartevent.com";
    private static final String TEST_PHONE = "9876501234";
    private static final String TEST_PASSWORD = "Test@123";
    private static final String TEST_NAME = "Test Customer";

    @EventListener(ApplicationReadyEvent.class)
    @Order(10)
    public void createTestCustomer() {
        try {
            if (userProfileRepository.existsByEmail(TEST_EMAIL)) {
                log.info("Test customer already exists ({})", TEST_EMAIL);
                return;
            }

            if (userProfileRepository.existsByPhone(TEST_PHONE)) {
                log.info("Test customer phone already in use, skipping creation");
                return;
            }

            RegisterRequest request = new RegisterRequest();
            request.setEmail(TEST_EMAIL);
            request.setPhone(TEST_PHONE);
            request.setPassword(TEST_PASSWORD);
            request.setFullName(TEST_NAME);
            request.setIsVendor(false);

            authService.register(request);
            log.info("=== TEST CUSTOMER CREATED ===");
            log.info("  Email:    {}", TEST_EMAIL);
            log.info("  Phone:    {}", TEST_PHONE);
            log.info("  Password: {}", TEST_PASSWORD);
            log.info("=============================");
        } catch (Exception e) {
            log.warn("Could not create test customer: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
