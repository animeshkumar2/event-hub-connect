package com.eventhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Prevent lazy loading issues
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;
    
    @ManyToOne
    @JoinColumn(name = "vendor_category_id", nullable = false)
    private Category vendorCategory;
    
    @Column(name = "custom_category_name", length = 255)
    private String customCategoryName; // Custom category name when vendorCategory is "other"
    
    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;
    
    @Column(name = "city_name", length = 100)
    private String cityName;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    private Integer reviewCount = 0;
    
    @Column(name = "starting_price", precision = 10, scale = 2)
    private BigDecimal startingPrice = BigDecimal.ZERO;
    
    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;
    
    @Column(name = "portfolio_images", columnDefinition = "TEXT[]")
    private List<String> portfolioImages;
    
    @Column(name = "coverage_radius")
    private Integer coverageRadius = 0;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Prevent circular serialization
    private List<Listing> listings;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

