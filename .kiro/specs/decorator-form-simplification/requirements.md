# Requirements Document

## Introduction

The decorator vendor listing form on cartevent currently has 12 fields with significant redundancy — individual checkboxes that duplicate multiselect options, rarely-used numeric fields, and too many steps for vendors who just want to list their decoration services. This feature simplifies the form to ~4-5 fields using a setup-type-based approach: vendors pick a setup type via visual cards, get a pre-populated inclusion checklist, set their price, and they're done. The goal is higher form completion rates while keeping the existing single "decorator" category and backward compatibility with existing listings.

## Glossary

- **Decorator_Form**: The category-specific field configuration and rendered form for the "decorator" category in the vendor listing creation flow
- **Setup_Type**: A predefined decoration service category (e.g., Balloon Decoration, Floral Setup, Stage/Mandap) presented as a visual card picker, used to pre-populate the inclusions checklist
- **Setup_Type_Picker**: A visual card-based selector component that replaces the old `decorType` multiselect, allowing vendors to choose one or more setup types
- **Inclusions_Checklist**: A pre-populated multiselect of items included in the decoration service, with defaults based on the selected setup type(s); vendors toggle items on/off and can add custom entries
- **Category_Field_Config**: The `FieldSchema[]` configuration in `categoryFieldConfigs.ts` that defines which fields appear for a given vendor category
- **Listing_Template**: A pre-built template in `listingTemplates.ts` that pre-fills listing data for quick vendor onboarding
- **Field_Schema**: The TypeScript interface defining a single form field's properties (name, label, type, options, dependencies, etc.)

## Requirements

### Requirement 1: Remove Redundant Fields

**User Story:** As a decorator vendor, I want a shorter listing form without duplicate or rarely-used fields, so that I can create listings faster.

#### Acceptance Criteria

1. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `coverageArea` field
2. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `tableCenterpieces` field
3. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `stageBackdrop` checkbox field
4. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `entranceArch` checkbox field
5. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `ceilingDraping` checkbox field
6. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL NOT display the `aisleDecoration` checkbox field
7. WHEN the Decorator_Form is rendered, THE Decorator_Form SHALL contain no more than 5 field entries in the Category_Field_Config

### Requirement 2: Setup Type Picker

**User Story:** As a decorator vendor, I want to pick my decoration service type from visual cards, so that I can quickly indicate what kind of decoration I offer.

#### Acceptance Criteria

1. WHEN the Decorator_Form is rendered, THE Setup_Type_Picker SHALL display the following setup types as selectable options: "Balloon Decoration", "Floral Setup", "Stage / Mandap", "Room Decoration", "Car Decoration", "Entrance & Pathway", "Table Setting", "Ceiling & Draping"
2. WHEN a vendor selects a setup type, THE Setup_Type_Picker SHALL allow multiple setup types to be selected simultaneously
3. WHEN no setup type is selected, THE Decorator_Form SHALL require at least one setup type before submission
4. THE Setup_Type_Picker SHALL store selected values in the `setupType` field of the Category_Field_Config as a multiselect field

### Requirement 3: Pre-Populated Inclusions Based on Setup Type

**User Story:** As a decorator vendor, I want the "What's Included" checklist to be pre-populated based on my chosen setup type, so that I don't have to manually pick common items.

#### Acceptance Criteria

1. WHEN a vendor selects a setup type, THE Inclusions_Checklist SHALL pre-select default inclusion items associated with that setup type
2. WHEN a vendor selects multiple setup types, THE Inclusions_Checklist SHALL merge the default inclusions from all selected setup types without duplicates
3. WHEN a vendor deselects a setup type, THE Inclusions_Checklist SHALL remove only the default items unique to that deselected setup type, preserving items that belong to other selected setup types or were manually added
4. WHEN the Inclusions_Checklist is displayed, THE Inclusions_Checklist SHALL allow vendors to toggle individual items on or off regardless of defaults
5. WHEN the Inclusions_Checklist is displayed, THE Inclusions_Checklist SHALL allow vendors to add custom inclusion items not in the predefined list
6. THE Inclusions_Checklist SHALL use the existing `includes` field name in the Category_Field_Config to maintain backward compatibility

### Requirement 4: Simplified Field Set

**User Story:** As a decorator vendor, I want the final form to have only the essential fields, so that I can complete my listing in under a minute.

#### Acceptance Criteria

1. THE Decorator_Form SHALL contain exactly these fields in order: `setupType` (multiselect, required), `includes` (multiselect, required), `theme` (select, optional), `price` (number, required), `customizationAvailable` (checkbox, optional)
2. THE Decorator_Form SHALL retain the `showPackageDetails: true` setting to preserve the existing Included/Excluded/Extra Charges accordion
3. THE Decorator_Form SHALL retain `dismantlingIncluded` as a default-true value in the inclusions list rather than a separate checkbox field

### Requirement 5: Backward Compatibility

**User Story:** As a platform operator, I want existing decorator listings to continue displaying correctly after the form changes, so that no vendor data is lost or broken.

#### Acceptance Criteria

1. WHEN an existing decorator listing is loaded for editing, THE Decorator_Form SHALL map legacy `decorType` values to the corresponding `setupType` values
2. WHEN an existing decorator listing contains legacy checkbox values (`stageBackdrop`, `entranceArch`, `ceilingDraping`, `aisleDecoration`), THE Decorator_Form SHALL merge those values into the `includes` field
3. WHEN an existing decorator listing is saved after editing, THE Decorator_Form SHALL persist data using the new field names (`setupType`, `includes`, `theme`, `price`, `customizationAvailable`)
4. IF an existing listing has `coverageArea` or `tableCenterpieces` data, THEN THE Decorator_Form SHALL preserve that data in storage without displaying the fields in the form

### Requirement 6: Update Listing Templates

**User Story:** As a decorator vendor, I want the pre-built listing templates to use the new simplified field structure, so that templates work correctly with the new form.

#### Acceptance Criteria

1. WHEN a vendor selects a decorator listing template, THE Listing_Template SHALL populate the `setupType` field instead of the legacy `decorType` field
2. WHEN a vendor selects a decorator listing template, THE Listing_Template SHALL populate the `includes` field with the consolidated inclusions (merging former checkbox values)
3. THE Listing_Template SHALL NOT contain references to removed fields (`coverageArea`, `tableCenterpieces`, `stageBackdrop`, `entranceArch`, `ceilingDraping`, `aisleDecoration`)
