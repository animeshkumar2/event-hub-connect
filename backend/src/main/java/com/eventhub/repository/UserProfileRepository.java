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
    boolean existsByEmail(String email);
    
    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.role = :role")
    long countByRole(@Param("role") UserProfile.Role role);
    
    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
}




