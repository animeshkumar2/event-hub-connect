package com.eventhub.repository;

import com.eventhub.model.EventTypeCategory;
import com.eventhub.model.EventTypeCategoryId;
import com.eventhub.model.EventType;
import com.eventhub.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventTypeCategoryRepository extends JpaRepository<EventTypeCategory, EventTypeCategoryId> {
    List<EventTypeCategory> findByEventType(EventType eventType);
    List<EventTypeCategory> findByCategory(Category category);
    boolean existsByEventTypeAndCategory(EventType eventType, Category category);
}

