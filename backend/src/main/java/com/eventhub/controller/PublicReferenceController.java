package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Category;
import com.eventhub.model.City;
import com.eventhub.model.EventType;
import com.eventhub.model.EventTypeCategory;
import com.eventhub.repository.CategoryRepository;
import com.eventhub.repository.CityRepository;
import com.eventhub.repository.EventTypeRepository;
import com.eventhub.repository.EventTypeCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicReferenceController {
    
    private final EventTypeRepository eventTypeRepository;
    private final CategoryRepository categoryRepository;
    private final CityRepository cityRepository;
    private final EventTypeCategoryRepository eventTypeCategoryRepository;
    
    @GetMapping("/event-types")
    public ResponseEntity<ApiResponse<List<EventType>>> getEventTypes() {
        List<EventType> eventTypes = eventTypeRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(eventTypes));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<City>>> getCities() {
        List<City> cities = cityRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }
    
    @GetMapping("/event-type-categories")
    public ResponseEntity<ApiResponse<List<EventTypeCategory>>> getEventTypeCategories() {
        List<EventTypeCategory> mappings = eventTypeCategoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(mappings));
    }
}





