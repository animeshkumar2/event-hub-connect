---
title: Implementation Guide
status: draft
---

# Category-Specific Listings - Implementation Guide

Step-by-step guide for implementing category-specific listing forms.

## Phase 1: Backend Infrastructure

### Step 1: Database Migration

Create migration file: `V1__add_category_specific_fields.sql`

```sql
-- Add new columns to listings table
ALTER TABLE listings 
ADD COLUMN pricing_model VARCHAR(50),
ADD COLUMN category_specific_data JSONB;

-- Create indexes
CREATE INDEX idx_listings_pricing_model ON listings (pricing_model);
CREATE INDEX idx_listings_category_data ON listings USING GIN (category_specific_data);

-- Add check constraint for pricing_model
ALTER TABLE listings 
ADD CONSTRAINT chk_pricing_model 
CHECK (pricing_model IN (
  'per_plate', 'per_hour', 'per_event', 'per_day', 
  'per_person', 'per_setup', 'per_item', 'fixed'
));
```

### Step 2: Update Listing Entity

File: `backend/src/main/java/com/eventhub/model/Listing.java`

```java
@Entity
@Table(name = "listings")
public class Listing {
    // ... existing fields ...
    
    @Column(name = "pricing_model", length = 50)
    @Enumerated(EnumType.STRING)
    private PricingModel pricingModel;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_specific_data", columnDefinition = "JSONB")
    private String categorySpecificData;
    
    // Getters and setters
}
```


### Step 3: Create PricingModel Enum

File: `backend/src/main/java/com/eventhub/model/PricingModel.java`

```java
package com.eventhub.model;

public enum PricingModel {
    PER_PLATE("per_plate"),
    PER_HOUR("per_hour"),
    PER_EVENT("per_event"),
    PER_DAY("per_day"),
    PER_PERSON("per_person"),
    PER_SETUP("per_setup"),
    PER_ITEM("per_item"),
    FIXED("fixed");
    
    private final String value;
    
    PricingModel(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

### Step 4: Create Category Field Configuration Model

File: `backend/src/main/java/com/eventhub/model/CategoryFieldConfig.java`

```java
package com.eventhub.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "category_field_configs")
@Data
public class CategoryFieldConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "category_id", nullable = false, unique = true)
    private String categoryId;
    
    @Column(name = "pricing_model", nullable = false)
    @Enumerated(EnumType.STRING)
    private PricingModel pricingModel;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_schema", columnDefinition = "JSONB", nullable = false)
    private String fieldSchema;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}
```


### Step 5: Create Repository

File: `backend/src/main/java/com/eventhub/repository/CategoryFieldConfigRepository.java`

```java
package com.eventhub.repository;

import com.eventhub.model.CategoryFieldConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CategoryFieldConfigRepository extends JpaRepository<CategoryFieldConfig, UUID> {
    Optional<CategoryFieldConfig> findByCategoryIdAndIsActiveTrue(String categoryId);
}
```

### Step 6: Create Service

File: `backend/src/main/java/com/eventhub/service/CategoryFieldService.java`

```java
package com.eventhub.service;

import com.eventhub.model.CategoryFieldConfig;
import com.eventhub.repository.CategoryFieldConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryFieldService {
    private final CategoryFieldConfigRepository repository;
    
    @Cacheable(value = "categoryFields", key = "#categoryId")
    public CategoryFieldConfig getFieldConfig(String categoryId) {
        return repository.findByCategoryIdAndIsActiveTrue(categoryId)
            .orElse(null);
    }
}
```

### Step 7: Create Controller Endpoint

File: `backend/src/main/java/com/eventhub/controller/CategoryFieldController.java`

```java
package com.eventhub.controller;

import com.eventhub.model.CategoryFieldConfig;
import com.eventhub.service.CategoryFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryFieldController {
    private final CategoryFieldService categoryFieldService;
    
    @GetMapping("/{categoryId}/fields")
    public ResponseEntity<CategoryFieldConfig> getFieldConfig(
        @PathVariable String categoryId
    ) {
        CategoryFieldConfig config = categoryFieldService.getFieldConfig(categoryId);
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }
}
```


### Step 8: Update Listing Controller

Update `VendorListingController.java` to handle category-specific data:

```java
@PostMapping
public ResponseEntity<Listing> createListing(
    @RequestBody CreateListingRequest request,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Validate category-specific data if present
    if (request.getCategorySpecificData() != null) {
        validateCategoryData(
            request.getListingCategoryId(), 
            request.getCategorySpecificData()
        );
    }
    
    Listing listing = listingService.createListing(request, userDetails);
    return ResponseEntity.ok(listing);
}

private void validateCategoryData(String categoryId, String data) {
    CategoryFieldConfig config = categoryFieldService.getFieldConfig(categoryId);
    if (config == null) return;
    
    // Validate JSON against schema
    // Implementation depends on validation library
}
```

## Phase 2: Frontend Implementation

### Step 1: Create Field Type Components

File: `frontend/src/features/vendor/components/CategoryFields/FieldTypes.tsx`

```typescript
// Text Input
export const TextFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
      />
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Number Input
export const NumberFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        {field.unit && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {field.unit}
          </span>
        )}
        <Input
          id={field.name}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(field.name, parseFloat(e.target.value))}
          min={field.min}
          max={field.max}
          className={field.unit ? 'pl-8' : ''}
        />
      </div>
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Select Input
export const SelectFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Checkbox Input
export const CheckboxFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={field.name}
        checked={value || false}
        onCheckedChange={(checked) => onChange(field.name, checked)}
      />
      <div className="space-y-1">
        <Label htmlFor={field.name} className="cursor-pointer">
          {field.label}
        </Label>
        {field.helpText && (
          <p className="text-sm text-muted-foreground">{field.helpText}</p>
        )}
      </div>
    </div>
  );
};
```


### Step 2: Create Category Field Renderer

File: `frontend/src/features/vendor/components/CategoryFields/CategoryFieldRenderer.tsx`

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import {
  TextFieldInput,
  NumberFieldInput,
  SelectFieldInput,
  CheckboxFieldInput,
  MultiSelectFieldInput,
  TextAreaFieldInput
} from './FieldTypes';

interface CategoryFieldRendererProps {
  categoryId: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export const CategoryFieldRenderer: React.FC<CategoryFieldRendererProps> = ({
  categoryId,
  values,
  onChange,
  errors = {}
}) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setConfig(null);
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await api.get(`/api/categories/${categoryId}/fields`);
        setConfig(response.data);
      } catch (error) {
        console.error('Failed to fetch category config:', error);
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [categoryId]);

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value
    });
  };

  if (loading) {
    return <BrandedLoader fullScreen={false} message="Loading fields..." />;
  }

  if (!config || !config.fieldSchema) {
    return null;
  }

  const fields = JSON.parse(config.fieldSchema);

  const renderField = (field: any) => {
    const commonProps = {
      field,
      value: values[field.name],
      onChange: handleFieldChange,
      error: errors[field.name]
    };

    switch (field.type) {
      case 'text':
        return <TextFieldInput {...commonProps} />;
      case 'textarea':
        return <TextAreaFieldInput {...commonProps} />;
      case 'number':
        return <NumberFieldInput {...commonProps} />;
      case 'select':
        return <SelectFieldInput {...commonProps} />;
      case 'multiselect':
        return <MultiSelectFieldInput {...commonProps} />;
      case 'checkbox':
        return <CheckboxFieldInput {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Category-Specific Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field: any) => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```


### Step 3: Update Listing Form

Integrate CategoryFieldRenderer into the existing listing form:

```typescript
// In VendorListings.tsx or similar
const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});

// In the form JSX
<CategoryFieldRenderer
  categoryId={formData.listingCategoryId}
  values={categorySpecificData}
  onChange={setCategorySpecificData}
  errors={categoryFieldErrors}
/>

// When submitting
const handleSubmit = async () => {
  const payload = {
    ...formData,
    categorySpecificData: JSON.stringify(categorySpecificData)
  };
  
  await api.post('/api/vendor/listings', payload);
};
```

## Phase 3: Seed Data

### Create Seed Script

File: `backend/src/main/resources/db/seed/category_field_configs.sql`

```sql
-- Catering Configuration
INSERT INTO category_field_configs (id, category_id, pricing_model, field_schema, is_active)
VALUES (
  gen_random_uuid(),
  'caterer',
  'PER_PLATE',
  '[
    {
      "name": "cuisineType",
      "label": "Cuisine Type",
      "type": "select",
      "required": true,
      "options": ["North Indian", "South Indian", "Chinese", "Continental", "Multi-Cuisine"]
    },
    {
      "name": "pricePerPlateVeg",
      "label": "Price per Plate (Veg)",
      "type": "number",
      "required": true,
      "unit": "₹",
      "min": 100
    }
  ]'::jsonb,
  true
);

-- Photography Configuration
INSERT INTO category_field_configs (id, category_id, pricing_model, field_schema, is_active)
VALUES (
  gen_random_uuid(),
  'photographer',
  'PER_EVENT',
  '[
    {
      "name": "serviceType",
      "label": "Service Type",
      "type": "select",
      "required": true,
      "options": ["Photography Only", "Videography Only", "Both"]
    },
    {
      "name": "editedPhotos",
      "label": "Number of Edited Photos",
      "type": "number",
      "required": true,
      "min": 0
    }
  ]'::jsonb,
  true
);

-- Add more categories...
```

## Phase 4: Testing

### Backend Tests

```java
@Test
public void testCreateListingWithCategoryData() {
    CreateListingRequest request = new CreateListingRequest();
    request.setName("Test Catering");
    request.setListingCategoryId("caterer");
    request.setPricingModel(PricingModel.PER_PLATE);
    request.setCategorySpecificData("{\"cuisineType\":\"North Indian\",\"pricePerPlateVeg\":450}");
    
    Listing listing = listingService.createListing(request, user);
    
    assertNotNull(listing.getCategorySpecificData());
    assertTrue(listing.getCategorySpecificData().contains("North Indian"));
}
```

### Frontend Tests

```typescript
describe('CategoryFieldRenderer', () => {
  it('renders fields based on category', async () => {
    render(
      <CategoryFieldRenderer
        categoryId="caterer"
        values={{}}
        onChange={jest.fn()}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Cuisine Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Price per Plate/i)).toBeInTheDocument();
    });
  });
});
```

## Deployment Checklist

- [ ] Run database migrations
- [ ] Seed category field configurations
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Test on staging environment
- [ ] Monitor error logs
- [ ] Verify existing listings still work
- [ ] Test creating new listings with category data
- [ ] Verify search and filter functionality

