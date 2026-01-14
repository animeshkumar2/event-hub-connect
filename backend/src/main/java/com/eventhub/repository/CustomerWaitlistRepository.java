package com.eventhub.repository;

import com.eventhub.model.CustomerWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerWaitlistRepository extends JpaRepository<CustomerWaitlist, Long> {
    
    Optional<CustomerWaitlist> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
