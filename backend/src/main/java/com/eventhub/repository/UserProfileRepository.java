package com.eventhub.repository;

import com.eventhub.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByEmail(String email);
    Optional<UserProfile> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.role = :role")
    long countByRole(@Param("role") UserProfile.Role role);
    
    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
    
    // Find vendor-role users who haven't completed onboarding (no vendor record yet)
    @Query(value = "SELECT u.* FROM user_profiles u WHERE u.role = 'VENDOR' " +
           "AND u.id NOT IN (SELECT v.user_id FROM vendors v) " +
           "ORDER BY u.created_at DESC",
           nativeQuery = true)
    java.util.List<UserProfile> findVendorUsersWithoutVendorProfile();
}











