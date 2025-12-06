package com.eventhub.service;

import com.eventhub.dto.response.EventRecommendationDTO;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPlannerService {
    
    private final VendorRepository vendorRepository;
    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    private final EventTypeRepository eventTypeRepository;
    
    /**
     * Advanced AI-powered vendor recommendations based on budget
     * Returns 3 best listing options per category
     * 
     * Algorithm:
     * - Decorator: 30% of budget
     * - Photographer: 25% of budget
     * - DJ: 20% of budget
     * - Caterer: Remaining budget (if sufficient - at least 500 per guest)
     * 
     * Selection Criteria (in order of priority):
     * 1. Event type matching
     * 2. Price within allocated budget (prefer 70-100% of budget for better value)
     * 3. Vendor rating (higher is better)
     * 4. Listing popularity/trending status
     * 5. Value score (rating/price ratio)
     */
    public List<EventRecommendationDTO> generateRecommendations(Integer budget, String eventType, Integer guestCount) {
        List<EventRecommendationDTO> recommendations = new ArrayList<>();
        
        // Parse event type ID
        Integer eventTypeId = null;
        try {
            eventTypeId = Integer.parseInt(eventType);
        } catch (NumberFormatException e) {
            // If eventType is not a number, try to find by name
            EventType et = eventTypeRepository.findAll().stream()
                .filter(type -> type.getName().equalsIgnoreCase(eventType))
                .findFirst()
                .orElse(null);
            if (et != null) {
                eventTypeId = et.getId();
            }
        }
        
        // Decorator: 30% of budget
        BigDecimal decorBudget = new BigDecimal(budget).multiply(new BigDecimal("0.30"));
        addCategoryRecommendations(recommendations, "decorator", decorBudget, eventTypeId, 
                "Essential for creating the perfect ambiance");
        
        // Photographer: 25% of budget
        BigDecimal photoBudget = new BigDecimal(budget).multiply(new BigDecimal("0.25"));
        addCategoryRecommendations(recommendations, "photographer", photoBudget, eventTypeId,
                "Capture your special moments forever");
        
        // DJ: 20% of budget
        BigDecimal djBudget = new BigDecimal(budget).multiply(new BigDecimal("0.20"));
        addCategoryRecommendations(recommendations, "dj", djBudget, eventTypeId,
                "Keep the party going with great music");
        
        // Caterer: Remaining budget (if sufficient - at least 500 per guest)
        BigDecimal totalAllocated = recommendations.stream()
                .map(EventRecommendationDTO::getAllocatedBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingBudget = new BigDecimal(budget).subtract(totalAllocated);
        
        BigDecimal minCatererBudget = new BigDecimal(guestCount).multiply(new BigDecimal("500"));
        if (remainingBudget.compareTo(minCatererBudget) >= 0) {
            addCategoryRecommendations(recommendations, "caterer", remainingBudget, eventTypeId,
                    "Delicious food for all your guests");
        }
        
        return recommendations;
    }
    
    /**
     * Find and add 3 best listing options for a category
     */
    private void addCategoryRecommendations(List<EventRecommendationDTO> recommendations, 
                                          String categoryId, 
                                          BigDecimal allocatedBudget, 
                                          Integer eventTypeId,
                                          String defaultReason) {
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) return;
        
        // Find all active vendors in this category
        List<Vendor> vendors = vendorRepository.findByVendorCategoryIdAndIsActiveTrue(categoryId);
        if (vendors.isEmpty()) return;
        
        // Collect all eligible packages
        List<PackageCandidate> candidates = new ArrayList<>();
        
        for (Vendor vendor : vendors) {
            // Get all packages for this vendor
            List<Listing> packages = listingRepository.findByVendorIdAndTypeAndIsActiveTrue(
                    vendor.getId(), Listing.ListingType.PACKAGE);
            
            for (Listing pkg : packages) {
                // Filter by event type if provided
                if (eventTypeId != null && pkg.getEventTypes() != null) {
                    boolean matchesEventType = pkg.getEventTypes().stream()
                            .anyMatch(et -> et.getId().equals(eventTypeId));
                    if (!matchesEventType) continue;
                }
                
                // Only consider packages within budget
                if (pkg.getPrice().compareTo(allocatedBudget) <= 0) {
                    BigDecimal valueScore = calculateValueScore(pkg, vendor, allocatedBudget);
                    
                    candidates.add(new PackageCandidate(
                            pkg, vendor, valueScore, defaultReason
                    ));
                }
            }
        }
        
        if (candidates.isEmpty()) return;
        
        // Sort by value score (descending) and take top 3
        List<PackageCandidate> topCandidates = candidates.stream()
                .sorted((a, b) -> b.valueScore.compareTo(a.valueScore))
                .limit(3)
                .collect(Collectors.toList());
        
        // Create recommendation DTO
        EventRecommendationDTO recommendation = new EventRecommendationDTO();
        recommendation.setCategory(categoryId);
        recommendation.setCategoryName(category.getName());
        recommendation.setAllocatedBudget(allocatedBudget);
        
        List<EventRecommendationDTO.ListingOption> options = new ArrayList<>();
        for (int i = 0; i < topCandidates.size(); i++) {
            PackageCandidate candidate = topCandidates.get(i);
            EventRecommendationDTO.ListingOption option = createListingOption(
                    candidate, allocatedBudget, i + 1
            );
            options.add(option);
        }
        
        recommendation.setOptions(options);
        recommendations.add(recommendation);
    }
    
    /**
     * Calculate value score for a package
     * Higher score = better recommendation
     * 
     * Factors:
     * - Price proximity to budget (70-100% gets highest score)
     * - Vendor rating (0-5 scale, normalized to 0-1)
     * - Listing popularity/trending (bonus points)
     * - Value ratio (rating/price)
     */
    private BigDecimal calculateValueScore(Listing pkg, Vendor vendor, BigDecimal allocatedBudget) {
        BigDecimal score = BigDecimal.ZERO;
        
        // 1. Price proximity score (40% weight)
        // Prefer packages that use 70-100% of allocated budget (best value)
        BigDecimal priceRatio = pkg.getPrice().divide(allocatedBudget, 4, RoundingMode.HALF_UP);
        BigDecimal priceScore;
        if (priceRatio.compareTo(new BigDecimal("0.7")) >= 0 && priceRatio.compareTo(new BigDecimal("1.0")) <= 0) {
            // Optimal range: 70-100% of budget
            priceScore = new BigDecimal("1.0");
        } else if (priceRatio.compareTo(new BigDecimal("0.5")) >= 0) {
            // Good range: 50-70% of budget
            priceScore = priceRatio.multiply(new BigDecimal("1.2"));
        } else {
            // Lower range: less than 50% of budget
            priceScore = priceRatio.multiply(new BigDecimal("0.8"));
        }
        score = score.add(priceScore.multiply(new BigDecimal("0.4")));
        
        // 2. Vendor rating score (30% weight)
        // Normalize rating from 0-5 to 0-1
        BigDecimal ratingScore = vendor.getRating() != null 
                ? vendor.getRating().divide(new BigDecimal("5.0"), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        score = score.add(ratingScore.multiply(new BigDecimal("0.3")));
        
        // 3. Popularity/Trending bonus (20% weight)
        BigDecimal popularityScore = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(pkg.getIsTrending())) {
            popularityScore = popularityScore.add(new BigDecimal("1.0"));
        } else if (Boolean.TRUE.equals(pkg.getIsPopular())) {
            popularityScore = popularityScore.add(new BigDecimal("0.7"));
        }
        score = score.add(popularityScore.multiply(new BigDecimal("0.2")));
        
        // 4. Value ratio (rating/price) (10% weight)
        // Higher rating per rupee = better value
        if (pkg.getPrice().compareTo(BigDecimal.ZERO) > 0 && vendor.getRating() != null) {
            BigDecimal valueRatio = vendor.getRating().divide(pkg.getPrice(), 6, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("1000")); // Scale up for meaningful comparison
            // Normalize to 0-1 range (assuming max value ratio of 0.1)
            BigDecimal normalizedValueRatio = valueRatio.min(new BigDecimal("1.0"));
            score = score.add(normalizedValueRatio.multiply(new BigDecimal("0.1")));
        }
        
        return score;
    }
    
    /**
     * Create a ListingOption DTO from a candidate
     */
    private EventRecommendationDTO.ListingOption createListingOption(
            PackageCandidate candidate, BigDecimal allocatedBudget, int rank) {
        Listing pkg = candidate.listing;
        Vendor vendor = candidate.vendor;
        
        EventRecommendationDTO.ListingOption option = new EventRecommendationDTO.ListingOption();
        option.setVendorId(vendor.getId());
        option.setVendorName(vendor.getBusinessName());
        option.setVendorRating(vendor.getRating() != null ? vendor.getRating() : BigDecimal.ZERO);
        option.setVendorReviewCount(vendor.getReviewCount() != null ? vendor.getReviewCount() : 0);
        option.setPackageId(pkg.getId());
        option.setPackageName(pkg.getName());
        option.setPackageDescription(pkg.getDescription());
        option.setPrice(pkg.getPrice());
        option.setImages(pkg.getImages() != null ? pkg.getImages() : new ArrayList<>());
        option.setIsPopular(Boolean.TRUE.equals(pkg.getIsPopular()));
        option.setIsTrending(Boolean.TRUE.equals(pkg.getIsTrending()));
        option.setValueScore(candidate.valueScore);
        
        // Generate reason based on rank and features
        String reason = generateReason(candidate, allocatedBudget, rank);
        option.setReason(reason);
        
        return option;
    }
    
    /**
     * Generate a compelling reason for recommending this option
     */
    private String generateReason(PackageCandidate candidate, BigDecimal allocatedBudget, int rank) {
        Listing pkg = candidate.listing;
        Vendor vendor = candidate.vendor;
        List<String> reasons = new ArrayList<>();
        
        // Base reason
        reasons.add(candidate.defaultReason);
        
        // Add rank-specific reasons
        if (rank == 1) {
            reasons.add("Top-rated option with excellent value");
        } else if (rank == 2) {
            reasons.add("Great balance of quality and price");
        } else {
            reasons.add("Budget-friendly option");
        }
        
        // Add feature-based reasons
        if (Boolean.TRUE.equals(pkg.getIsTrending())) {
            reasons.add("Currently trending");
        } else if (Boolean.TRUE.equals(pkg.getIsPopular())) {
            reasons.add("Popular choice");
        }
        
        if (vendor.getRating() != null && vendor.getRating().compareTo(new BigDecimal("4.5")) >= 0) {
            reasons.add("Highly rated vendor");
        }
        
        // Price-based reason
        BigDecimal priceRatio = pkg.getPrice().divide(allocatedBudget, 2, RoundingMode.HALF_UP);
        if (priceRatio.compareTo(new BigDecimal("0.9")) >= 0) {
            reasons.add("Premium package");
        } else if (priceRatio.compareTo(new BigDecimal("0.7")) >= 0) {
            reasons.add("Great value for money");
        }
        
        return String.join(" • ", reasons);
    }
    
    /**
     * Helper class to hold package candidate with calculated score
     */
    private static class PackageCandidate {
        final Listing listing;
        final Vendor vendor;
        final BigDecimal valueScore;
        final String defaultReason;
        
        PackageCandidate(Listing listing, Vendor vendor, BigDecimal valueScore, String defaultReason) {
            this.listing = listing;
            this.vendor = vendor;
            this.valueScore = valueScore;
            this.defaultReason = defaultReason;
        }
    }
}
