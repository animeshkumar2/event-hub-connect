package com.eventhub.service;

import com.eventhub.dto.response.EventRecommendationDTO;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPlannerService {
    
    private final VendorRepository vendorRepository;
    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    
    /**
     * Generate AI-powered vendor recommendations based on budget
     * Algorithm:
     * - Decorator: 30% of budget
     * - Photographer: 25% of budget
     * - DJ: 20% of budget
     * - Caterer: Remaining budget (if sufficient)
     */
    public List<EventRecommendationDTO> generateRecommendations(Integer budget, String eventType, Integer guestCount) {
        List<EventRecommendationDTO> recommendations = new ArrayList<>();
        
        // Decorator: 30% of budget
        BigDecimal decorBudget = new BigDecimal(budget).multiply(new BigDecimal("0.30"));
        addRecommendation(recommendations, "decorator", decorBudget, eventType, 
                "Essential for creating the perfect ambiance");
        
        // Photographer: 25% of budget
        BigDecimal photoBudget = new BigDecimal(budget).multiply(new BigDecimal("0.25"));
        addRecommendation(recommendations, "photographer", photoBudget, eventType,
                "Capture your special moments forever");
        
        // DJ: 20% of budget
        BigDecimal djBudget = new BigDecimal(budget).multiply(new BigDecimal("0.20"));
        addRecommendation(recommendations, "dj", djBudget, eventType,
                "Keep the party going with great music");
        
        // Caterer: Remaining budget (if sufficient - at least 500 per guest)
        BigDecimal remainingBudget = new BigDecimal(budget)
                .subtract(recommendations.stream()
                        .map(EventRecommendationDTO::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        if (remainingBudget.compareTo(new BigDecimal(guestCount).multiply(new BigDecimal("500"))) >= 0) {
            addRecommendation(recommendations, "caterer", remainingBudget, eventType,
                    "Delicious food for all your guests");
        }
        
        return recommendations;
    }
    
    private void addRecommendation(List<EventRecommendationDTO> recommendations, String categoryId, 
                                  BigDecimal budget, String eventType, String reason) {
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) return;
        
        // Find vendors in this category
        List<Vendor> vendors = vendorRepository.findByVendorCategoryIdAndIsActiveTrue(categoryId);
        if (vendors.isEmpty()) return;
        
        // Find packages for these vendors within budget
        for (Vendor vendor : vendors) {
            List<Listing> packages = listingRepository.findByVendorIdAndTypeAndIsActiveTrue(
                    vendor.getId(), Listing.ListingType.PACKAGE);
            
            for (Listing pkg : packages) {
                if (pkg.getPrice().compareTo(budget) <= 0) {
                    EventRecommendationDTO rec = new EventRecommendationDTO();
                    rec.setCategory(categoryId);
                    rec.setVendorId(vendor.getId());
                    rec.setVendorName(vendor.getBusinessName());
                    rec.setPackageId(pkg.getId());
                    rec.setPackageName(pkg.getName());
                    rec.setPrice(pkg.getPrice());
                    rec.setReason(reason);
                    recommendations.add(rec);
                    return; // Add only one recommendation per category
                }
            }
        }
    }
}

