# Implementation Plan: Decorator Form Simplification

## Overview

Replace the 12-field decorator form with a 5-field setup-type-based form. Three files change: `categoryFieldConfigs.ts` (new field config + mappings), `CategoryFieldRenderer.tsx` (pre-population logic), and `listingTemplates.ts` (updated templates). A migration utility handles backward compatibility with existing listings.

## Tasks

- [ ] 1. Add setup type mappings and update decorator field config
  - [ ] 1.1 Add `SETUP_TYPE_DEFAULTS`, `LEGACY_DECOR_TYPE_MAP`, and `LEGACY_CHECKBOX_TO_INCLUDES` constants to `categoryFieldConfigs.ts`
    - Define the setup-type-to-inclusions mapping object
    - Define the legacy decorType-to-setupType mapping object
    - Define the legacy checkbox-to-includes mapping object
    - Export all three constants for use in other files
    - _Requirements: 3.1, 5.1, 5.2_
  - [ ] 1.2 Replace the decorator `fields` array in `CATEGORY_CONFIGS` with the new 5-field config
    - Replace all 12 fields with: `setupType` (multiselect, required), `includes` (multiselect, required), `theme` (select, optional), `price` (number, required), `customizationAvailable` (checkbox, optional)
    - Keep `pricingModel: 'per_setup'` and `showPackageDetails: true`
    - Add "Dismantling" to the `includes` options list
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_

- [ ] 2. Add pre-population logic to CategoryFieldRenderer
  - [ ] 2.1 Import the `SETUP_TYPE_DEFAULTS` constant into `CategoryFieldRenderer.tsx`
    - _Requirements: 3.1_
  - [ ] 2.2 Add `handleDecoratorSetupTypeChange` callback that computes merged includes when `setupType` changes
    - When setupType changes for decorator category, compute union of defaults for selected types
    - Preserve manually added items (items not in any default set)
    - On deselection, remove only items unique to the deselected type
    - Update both `setupType` and `includes` in a single onChange call
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 2.3 Wire the decorator-specific handler into the field rendering logic
    - Pass `handleDecoratorSetupTypeChange` instead of `handleFieldChange` for the `setupType` field when `categoryId === 'decorator'`
    - _Requirements: 3.1_

- [ ] 3. Add legacy data migration utility
  - [ ] 3.1 Create `migrateDecoratorData` function in `categoryFieldConfigs.ts`
    - Map `decorType` → `setupType` using `LEGACY_DECOR_TYPE_MAP`
    - Merge legacy checkbox true values into `includes` using `LEGACY_CHECKBOX_TO_INCLUDES`
    - Merge `dismantlingIncluded: true` into includes as "Dismantling"
    - Preserve `coverageArea` and `tableCenterpieces` in data
    - Remove legacy field keys from the migrated object
    - Return data unchanged if `setupType` already exists (already migrated)
    - Export the function
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 3.2 Integrate `migrateDecoratorData` into listing edit flow in `ListingPreview.tsx`
    - Call `migrateDecoratorData` on parsed `categorySpecificData` when `categoryId === 'decorator'` in the `enterEditMode` callback
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 4. Update decorator listing templates
  - [ ] 4.1 Update all three decorator templates in `listingTemplates.ts` to use new field structure
    - Replace `decorType` with `setupType` using mapped values
    - Consolidate `includes` by merging in former checkbox values
    - Remove `coverageArea`, `tableCenterpieces`, `stageBackdrop`, `entranceArch`, `ceilingDraping`, `aisleDecoration`, `dismantlingIncluded` from `categorySpecificData`
    - Add `customizationAvailable` field
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 5. Checkpoint - Verify form works end-to-end
  - Ensure all changes compile without errors, ask the user if questions arise.
