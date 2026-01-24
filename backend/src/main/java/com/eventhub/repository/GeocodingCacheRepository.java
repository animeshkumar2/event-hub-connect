package com.eventhub.repository;

import com.eventhub.model.GeocodingCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GeocodingCacheRepository extends JpaRepository<GeocodingCache, UUID> {
    
    /**
     * Find cached geocoding result by query text (case-insensitive)
     */
    @Query("SELECT g FROM GeocodingCache g WHERE LOWER(g.queryText) = LOWER(:queryText) AND g.expiresAt > :now")
    Optional<GeocodingCache> findByQueryTextIgnoreCaseAndNotExpired(
            @Param("queryText") String queryText, 
            @Param("now") LocalDateTime now);
    
    /**
     * Find cached geocoding result by exact query text
     */
    Optional<GeocodingCache> findByQueryText(String queryText);
    
    /**
     * Delete expired cache entries
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM GeocodingCache g WHERE g.expiresAt < :now")
    int deleteExpiredEntries(@Param("now") LocalDateTime now);
    
    /**
     * Check if a query is cached and not expired
     */
    @Query("SELECT COUNT(g) > 0 FROM GeocodingCache g WHERE LOWER(g.queryText) = LOWER(:queryText) AND g.expiresAt > :now")
    boolean existsByQueryTextAndNotExpired(@Param("queryText") String queryText, @Param("now") LocalDateTime now);
}
