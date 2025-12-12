package com.eventhub.repository;

import com.eventhub.model.ChatThread;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, UUID> {
    List<ChatThread> findByUserId(UUID userId);
    List<ChatThread> findByVendor(Vendor vendor);
    
    // Get threads with user details, ordered by last message
    @Query("SELECT c FROM ChatThread c LEFT JOIN FETCH c.user WHERE c.vendor = :vendor ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatThread> findByVendorOrderByLastMessageAtDesc(@Param("vendor") Vendor vendor);
    
    @Query("SELECT c FROM ChatThread c WHERE c.userId = :userId AND c.vendor = :vendor")
    Optional<ChatThread> findByUserIdAndVendor(@Param("userId") UUID userId, @Param("vendor") Vendor vendor);
}

