# Bookings & Payment Implementation Plan

## Overview
This document outlines the comprehensive implementation plan for the Bookings section with token payment flow.

## Completed ✅

1. **Backend Booking Service** (`VendorBookingService.java`)
   - `getAllBookings()` - Get all bookings with pagination
   - `getUpcomingBookings()` - Get upcoming bookings (event date >= today, status CONFIRMED/IN_PROGRESS)
   - `getPastBookings()` - Get past bookings (event date < today OR status COMPLETED)
   - `completeEvent()` - Complete an event and create past event

2. **Backend Booking Controller** (`VendorBookingController.java`)
   - `GET /api/vendors/bookings` - All bookings
   - `GET /api/vendors/bookings/upcoming` - Upcoming bookings
   - `GET /api/vendors/bookings/past` - Past bookings
   - `GET /api/vendors/bookings/{id}` - Get booking by ID
   - `POST /api/vendors/bookings/{id}/complete` - Complete event

3. **VendorPastEvent Model Update**
   - Updated to support multiple images (`List<String> images`)
   - Added `description` field
   - Added `order` reference

## Pending Implementation 🔄

### Payment Token Flow

#### 1. Direct Order Flow (No Chat/Negotiation)
- **Current State**: User creates order → Order created with PENDING status
- **Required Flow**: 
  - User creates order → User pays token amount → Create lead in vendor's Leads section → Vendor accepts → Move to Upcoming Bookings

**Backend Changes Needed:**
- Update `OrderService.createOrderFromCart()` to NOT create order immediately, but create a "pending order" record
- Create payment endpoint for token payment: `POST /api/customers/payments/token`
- When token is paid:
  - Create lead with status NEW in vendor's leads
  - Order status remains PENDING until vendor accepts
- Update `VendorLeadController` to accept lead (which creates/confirms the order)
- When vendor accepts lead → Order status becomes CONFIRMED → Moves to Upcoming Bookings

#### 2. Chat/Negotiate Flow
- **Current State**: User makes offer → Vendor accepts → Order created
- **Required Flow**:
  - User makes offer → Vendor accepts → User pays token → Order status CONFIRMED → Move to Upcoming Bookings
  - OR User accepts vendor counter → User pays token → Order status CONFIRMED → Move to Upcoming Bookings

**Backend Changes Needed:**
- Update `OfferService.acceptOffer()` to NOT create order immediately
  - Instead, create order with PENDING status
  - Lead status becomes CONVERTED but order waits for token payment
- Create endpoint for paying token after offer acceptance: `POST /api/customers/offers/{offerId}/pay-token`
- When token is paid:
  - Update order payment status to PARTIAL
  - Update order status to CONFIRMED
  - Order appears in Upcoming Bookings

#### 3. Token Amount Calculation
- Need to define token percentage (e.g., 20-30% of total amount)
- Update `Order` model to track `tokenAmount` (calculated field or separate field)
- Update payment service to handle partial payments

### Database Migration

**File**: `database/update_vendor_past_events_for_bookings.sql`
- Run this migration to update vendor_past_events table
- Creates `vendor_past_event_images` table for multiple images
- Adds `order_id` and `description` columns

### Frontend Updates

1. ✅ Create `VendorBookings.tsx` component (in progress)
   - Three sections: All, Upcoming, Past
   - Upcoming bookings lifecycle display
   - Complete event functionality

2. Update API services (`api.ts`)
   - Add booking endpoints
   - Add complete event endpoint

3. Update routes (`App.tsx`)
   - Change `/vendor/orders` to `/vendor/bookings`

4. Update sidebar (`VendorSidebar.tsx`)
   - Change "Orders" to "Bookings"

5. Update hooks (`useApi.ts`)
   - Add booking hooks

## Implementation Priority

### Phase 1: UI Implementation (Current Focus) ✅
- [x] Create VendorBookings component
- [x] Three sections (All, Upcoming, Past)
- [x] Lifecycle display for upcoming bookings
- [x] Complete event functionality

### Phase 2: Payment Token Flow (Next)
- [ ] Update OrderService for direct orders
- [ ] Create token payment endpoints
- [ ] Update OfferService for chat/negotiate flow
- [ ] Update LeadService to handle order creation from leads

### Phase 3: Integration & Testing
- [ ] End-to-end testing
- [ ] Update documentation
- [ ] User acceptance testing

## Notes

- Token payment flow requires significant backend changes and should be implemented as a separate phase
- The UI can be completed first, showing the booking structure without token payment integration
- Payment token flow can be added incrementally
