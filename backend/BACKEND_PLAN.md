# Event Hub Connect - Complete Backend Implementation Plan

> **Purpose**: Comprehensive plan for implementing the Java Spring Boot backend to support all frontend features and user journeys.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Endpoints - Complete List](#api-endpoints---complete-list)
3. [Entity Models & Database Layer](#entity-models--database-layer)
4. [Service Layer - Business Logic](#service-layer---business-logic)
5. [Controller Layer - REST APIs](#controller-layer---rest-apis)
6. [DTOs & Request/Response Models](#dtos--requestresponse-models)
7. [Authentication & Authorization](#authentication--authorization)
8. [Validation & Error Handling](#validation--error-handling)
9. [Background Jobs & Scheduled Tasks](#background-jobs--scheduled-tasks)
10. [Integration Points](#integration-points)
11. [Testing Strategy](#testing-strategy)
12. [Performance & Optimization](#performance--optimization)
13. [Security Considerations](#security-considerations)
14. [Deployment & DevOps](#deployment--devops)

---

## Architecture Overview

### Technology Stack
- **Framework**: Spring Boot 3.x
- **ORM**: JPA/Hibernate
- **Database**: PostgreSQL (Supabase)
- **Build Tool**: Maven
- **Containerization**: Docker
- **API Style**: RESTful JSON APIs

### Project Structure
```
backend/
├── src/main/java/com/eventhub/
│   ├── config/              # Configuration classes (CORS, Security, etc.)
│   ├── model/               # JPA Entity models
│   ├── repository/          # Spring Data JPA repositories
│   ├── service/             # Business logic services
│   ├── controller/          # REST controllers
│   ├── dto/                 # Data Transfer Objects
│   ├── exception/           # Custom exceptions
│   ├── security/            # Security configuration
│   ├── util/                # Utility classes
│   └── EventHubApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

---

## API Endpoints - Complete List

### 1. Public Endpoints (No Authentication)

#### Home Page & Discovery
- `GET /api/public/stats` - Get platform statistics (vendors count, events completed, avg rating, satisfaction rate)
- `GET /api/public/event-types` - Get all event types
- `GET /api/public/categories` - Get all categories
- `GET /api/public/cities` - Get all cities
- `GET /api/public/event-type-categories` - Get event type → category mappings
- `GET /api/public/featured-vendors?limit=6` - Get featured vendors for home page
- `GET /api/public/trending-setups?limit=10` - Get trending bookable setups
- `GET /api/public/vendors/{vendorId}` - Get vendor public profile (for customer view)

#### Search & Browse
- `GET /api/public/search/vendors` - Search vendors (no event type filter)
  - Query params: `q`, `category`, `city`, `minBudget`, `maxBudget`, `sortBy`, `page`, `size`
- `GET /api/public/search/listings` - Search listings/packages (with event type filter)
  - Query params: `eventType`, `category`, `listingType` (all/packages), `city`, `minBudget`, `maxBudget`, `q`, `sortBy`, `page`, `size`
  - **Critical**: Must implement strict filtering: Event Type → Category → Listing

#### Vendor Details (Public View)
- `GET /api/public/vendors/{vendorId}/packages` - Get all packages for a vendor
- `GET /api/public/vendors/{vendorId}/listings` - Get all individual listings for a vendor
- `GET /api/public/vendors/{vendorId}/reviews` - Get vendor reviews (paginated)
- `GET /api/public/vendors/{vendorId}/faqs` - Get vendor FAQs
- `GET /api/public/vendors/{vendorId}/portfolio` - Get vendor portfolio images
- `GET /api/public/vendors/{vendorId}/past-events` - Get vendor past events gallery
- `GET /api/public/vendors/{vendorId}/bookable-setups` - Get bookable setups
- `GET /api/public/vendors/{vendorId}/availability` - Get vendor availability calendar (next 3 months)
- `GET /api/public/packages/{packageId}` - Get package details
- `GET /api/public/packages/{packageId}/add-ons` - Get add-ons for a package
- `GET /api/public/listings/{listingId}` - Get individual listing details

### 2. Customer Endpoints (Authenticated)

#### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user profile

#### Cart Management
- `GET /api/customers/cart` - Get customer's cart items
- `POST /api/customers/cart/items` - Add item to cart
  - Body: `{ vendorId, listingId, itemType, quantity, eventDate, eventTime, addOns[], customizations }`
- `PUT /api/customers/cart/items/{itemId}` - Update cart item (quantity, date, add-ons, etc.)
- `DELETE /api/customers/cart/items/{itemId}` - Remove item from cart
- `DELETE /api/customers/cart` - Clear entire cart
- `GET /api/customers/cart/summary` - Get cart summary (subtotal, platform fee, GST, total)

#### Orders & Checkout
- `POST /api/customers/orders` - Create order from cart
  - Body: `{ paymentMethod, cardDetails?, upiId?, customerDetails }`
- `GET /api/customers/orders` - Get customer's orders (paginated)
- `GET /api/customers/orders/{orderId}` - Get order details
- `GET /api/customers/orders/{orderId}/timeline` - Get order status timeline
- `POST /api/customers/orders/{orderId}/cancel` - Cancel order
- `POST /api/customers/orders/{orderId}/review` - Submit review for completed order

#### Payments
- `POST /api/customers/payments/initiate` - Initiate payment (create payment intent)
- `POST /api/customers/payments/verify` - Verify payment (webhook handler)
- `GET /api/customers/payments/{paymentId}` - Get payment status

#### Event Planner
- `POST /api/customers/event-planner/recommendations` - Get AI-powered vendor recommendations
  - Body: `{ budget, eventType, guestCount }`
  - Returns: Recommended vendors with packages matching budget allocation

#### Chat & Communication
- `GET /api/customers/chat/threads` - Get customer's chat threads
- `GET /api/customers/chat/threads/{threadId}/messages` - Get messages in a thread
- `POST /api/customers/chat/threads/{threadId}/messages` - Send message to vendor
- `POST /api/customers/chat/threads` - Create new chat thread with vendor

#### Leads & Inquiries
- `POST /api/customers/leads` - Submit inquiry/lead to vendor
  - Body: `{ vendorId, eventType, eventDate, venueAddress, guestCount, budget, message }`

### 3. Vendor Endpoints (Authenticated - Vendor Role)

#### Vendor Profile Management
- `GET /api/vendors/profile` - Get vendor's own profile
- `PUT /api/vendors/profile` - Update vendor profile
- `POST /api/vendors/profile/cover-image` - Upload cover image
- `POST /api/vendors/profile/portfolio-images` - Upload portfolio images
- `DELETE /api/vendors/profile/portfolio-images/{imageId}` - Delete portfolio image

#### Listings Management
- `GET /api/vendors/listings` - Get all vendor's listings (packages + items)
- `GET /api/vendors/listings/packages` - Get all packages
- `GET /api/vendors/listings/items` - Get all individual listings
- `POST /api/vendors/listings/packages` - Create new package
  - Body: `{ name, description, price, category, eventTypes[], includedItems[], excludedItems[], deliveryTime, extraCharges[], images[], addOns[] }`
- `POST /api/vendors/listings/items` - Create new individual listing
  - Body: `{ name, description, price, category, eventTypes[], unit, minimumQuantity, images[] }`
- `PUT /api/vendors/listings/{listingId}` - Update listing (package or item)
- `DELETE /api/vendors/listings/{listingId}` - Delete listing
- `PUT /api/vendors/listings/{listingId}/status` - Toggle listing active/inactive
- `POST /api/vendors/listings/{packageId}/add-ons` - Add add-on to package
- `PUT /api/vendors/listings/{packageId}/add-ons/{addOnId}` - Update add-on
- `DELETE /api/vendors/listings/{packageId}/add-ons/{addOnId}` - Delete add-on

#### Bookable Setups
- `GET /api/vendors/bookable-setups` - Get all bookable setups
- `POST /api/vendors/bookable-setups` - Create bookable setup
- `PUT /api/vendors/bookable-setups/{setupId}` - Update setup
- `DELETE /api/vendors/bookable-setups/{setupId}` - Delete setup

#### Availability & Calendar
- `GET /api/vendors/availability` - Get availability slots (date range)
- `POST /api/vendors/availability` - Create/update availability slots (bulk)
  - Body: `{ date, timeSlots: [{ time, status }] }`
- `PUT /api/vendors/availability/{slotId}` - Update single slot
- `DELETE /api/vendors/availability/{slotId}` - Delete slot
- `GET /api/vendors/availability/calendar` - Get calendar view (next 3 months)

#### Orders Management
- `GET /api/vendors/orders` - Get vendor's orders (with filters)
  - Query params: `status`, `dateFrom`, `dateTo`, `page`, `size`
- `GET /api/vendors/orders/{orderId}` - Get order details
- `PUT /api/vendors/orders/{orderId}/status` - Update order status
- `POST /api/vendors/orders/{orderId}/confirm` - Confirm order
- `POST /api/vendors/orders/{orderId}/cancel` - Cancel order (vendor side)
- `GET /api/vendors/orders/upcoming` - Get upcoming orders
- `GET /api/vendors/orders/statistics` - Get order statistics (revenue, count, etc.)

#### Leads Management
- `GET /api/vendors/leads` - Get all leads (with filters)
  - Query params: `status`, `dateFrom`, `dateTo`, `page`, `size`
- `GET /api/vendors/leads/{leadId}` - Get lead details
- `PUT /api/vendors/leads/{leadId}/status` - Update lead status
- `POST /api/vendors/leads/{leadId}/quotes` - Create quote for lead
  - Body: `{ listingId, itemType, amount, description }`
- `PUT /api/vendors/leads/{leadId}/quotes/{quoteId}` - Update quote
- `DELETE /api/vendors/leads/{leadId}/quotes/{quoteId}` - Delete quote

#### Reviews Management
- `GET /api/vendors/reviews` - Get all reviews for vendor
- `GET /api/vendors/reviews/statistics` - Get review statistics (avg rating, count, distribution)
- `POST /api/vendors/reviews/{reviewId}/reply` - Reply to review

#### FAQs Management
- `GET /api/vendors/faqs` - Get all FAQs
- `POST /api/vendors/faqs` - Create FAQ
- `PUT /api/vendors/faqs/{faqId}` - Update FAQ
- `DELETE /api/vendors/faqs/{faqId}` - Delete FAQ
- `PUT /api/vendors/faqs/reorder` - Reorder FAQs (update display_order)

#### Chat & Communication
- `GET /api/vendors/chat/threads` - Get vendor's chat threads
- `GET /api/vendors/chat/threads/{threadId}/messages` - Get messages
- `POST /api/vendors/chat/threads/{threadId}/messages` - Send message
- `PUT /api/vendors/chat/threads/{threadId}/read` - Mark thread as read

#### Wallet & Payments
- `GET /api/vendors/wallet` - Get wallet balance and summary
- `GET /api/vendors/wallet/transactions` - Get wallet transactions (paginated)
- `POST /api/vendors/wallet/withdraw` - Request withdrawal
- `GET /api/vendors/wallet/payouts` - Get payout history

#### Analytics & Dashboard
- `GET /api/vendors/dashboard/stats` - Get dashboard statistics
  - Returns: Upcoming bookings, pending leads, wallet balance, monthly revenue, etc.
- `GET /api/vendors/dashboard/revenue` - Get revenue analytics (time range)
- `GET /api/vendors/dashboard/bookings` - Get booking analytics
- `GET /api/vendors/dashboard/leads` - Get leads analytics
- `GET /api/vendors/dashboard/performance` - Get performance metrics

#### Past Events
- `GET /api/vendors/past-events` - Get past events gallery
- `POST /api/vendors/past-events` - Add past event
- `DELETE /api/vendors/past-events/{eventId}` - Delete past event

#### Settings
- `GET /api/vendors/settings` - Get vendor settings
- `PUT /api/vendors/settings` - Update settings

### 4. Admin Endpoints (Authenticated - Admin Role)

#### Vendor Management
- `GET /api/admin/vendors` - Get all vendors (with filters)
- `GET /api/admin/vendors/{vendorId}` - Get vendor details
- `PUT /api/admin/vendors/{vendorId}/verify` - Verify vendor
- `PUT /api/admin/vendors/{vendorId}/status` - Activate/deactivate vendor

#### Order Management
- `GET /api/admin/orders` - Get all orders (with filters)
- `GET /api/admin/orders/{orderId}` - Get order details
- `PUT /api/admin/orders/{orderId}/status` - Update order status
- `POST /api/admin/orders/{orderId}/refund` - Process refund

#### Platform Management
- `GET /api/admin/platform/stats` - Get platform-wide statistics
- `GET /api/admin/platform/revenue` - Get platform revenue analytics
- `GET /api/admin/platform/users` - Get user statistics

---

## Entity Models & Database Layer

### Core Entities (Already Defined in schema_v2.sql)

#### Reference Data Entities
1. **EventType** - Event types (Wedding, Birthday, etc.)
2. **Category** - Service categories (photographer, decorator, etc.)
3. **EventTypeCategory** - Junction table for event type → category mapping
4. **City** - Cities reference data

#### User & Vendor Entities
5. **UserProfile** - Extends Supabase auth.users
6. **Vendor** - Vendor business profiles
7. **VendorPastEvent** - Past events gallery

#### Listing Entities
8. **Listing** - Unified table for packages and items
   - Fields: `type` (package/item), `listing_category_id`, `eventTypes` (via junction)
9. **PackageItem** - Junction table linking packages to items
10. **ListingEventType** - Junction table for listings ↔ event types
11. **AddOn** - Add-ons for packages
12. **BookableSetup** - Bookable setup configurations

#### Review & FAQ Entities
13. **Review** - Customer reviews
14. **VendorFAQ** - Vendor FAQs

#### Availability Entity
15. **AvailabilitySlot** - Vendor availability calendar slots

#### Cart & Order Entities
16. **CartItem** - Shopping cart items
17. **CartItemAddOn** - Junction table for cart item add-ons
18. **Order** - Customer orders
19. **OrderAddOn** - Junction table for order add-ons
20. **OrderTimeline** - Order status history
21. **Payment** - Payment records

#### Lead & Quote Entities
22. **Lead** - Customer inquiries/leads
23. **Quote** - Vendor quotes for leads

#### Chat Entities
24. **ChatThread** - Chat conversation threads
25. **Message** - Chat messages

#### Wallet Entities
26. **VendorWallet** - Vendor wallet balances
27. **WalletTransaction** - Wallet transaction history
28. **Payout** - Payout requests

### Repository Layer Requirements

#### Custom Query Methods Needed

**VendorRepository:**
- Find by category with filters
- Find featured vendors (by rating, review count)
- Search vendors (name, category, city, budget)
- Find vendors with active listings for event type

**ListingRepository:**
- Find by vendor ID and type
- Search listings with strict filtering (event type → category → listing type)
- Find listings by event type (with category validation)
- Find listings by category (with event type validation)
- Find trending/popular listings
- Find listings within price range

**OrderRepository:**
- Find by user ID with status filter
- Find by vendor ID with status filter
- Find upcoming orders (date range)
- Calculate revenue statistics
- Find orders by date range

**LeadRepository:**
- Find by vendor ID with status filter
- Find by user ID
- Find new/unread leads

**ReviewRepository:**
- Find by vendor ID (paginated)
- Calculate average rating for vendor
- Find verified reviews only

**AvailabilitySlotRepository:**
- Find by vendor ID and date range
- Find available slots (status = 'available')
- Find booked slots

**CartItemRepository:**
- Find by user ID
- Find by user ID and vendor ID
- Calculate cart total

---

## Service Layer - Business Logic

### 1. Public Services

#### StatsService
- Calculate platform statistics:
  - Total verified vendors count
  - Total events completed (from orders)
  - Average rating across all vendors
  - Satisfaction rate (from reviews)

#### SearchService
- **Search Vendors**: Filter by category, city, budget, search query
- **Search Listings**: Implement strict filtering:
  1. Filter by event type (items must have eventTypes array containing event type)
  2. Validate category against event type (category must be in eventTypeCategories mapping)
  3. Filter by category (exact match on item category, not vendor category)
  4. Filter by listing type (all/packages)
  5. Apply additional filters (city, budget, search query)
  6. Sort results
- **Get Featured Vendors**: Select vendors based on rating, review count, recent activity
- **Get Trending Setups**: Select bookable setups based on views, bookings

#### VendorPublicService
- Get vendor public profile (with packages, listings, reviews, FAQs, portfolio)
- Get vendor availability calendar (next 3 months)
- Get vendor reviews (paginated, with filters)
- Get vendor bookable setups

### 2. Customer Services

#### CartService
- Add item to cart (validate listing exists, check availability)
- Update cart item (quantity, date, add-ons, customizations)
- Remove item from cart
- Clear cart
- Calculate cart summary:
  - Subtotal (sum of all items with add-ons and customizations)
  - Platform fee (5% of subtotal)
  - GST (18% of subtotal)
  - Total

#### OrderService
- Create order from cart:
  1. Validate cart items still exist and are available
  2. Check vendor availability for selected date/time
  3. Create order records for each cart item
  4. Create payment record
  5. Update availability slots to 'booked'
  6. Clear cart
  7. Send confirmation emails
- Get customer orders (with pagination, filters)
- Get order details (with timeline, payment info)
- Cancel order (validate cancellation policy, process refund if needed)
- Update order status

#### PaymentService
- Initiate payment (create payment intent with Razorpay/Stripe)
- Verify payment (webhook handler)
- Process refund
- Get payment status

#### EventPlannerService
- Generate vendor recommendations based on budget:
  - Algorithm:
    - Decorator: 30% of budget
    - Photographer: 25% of budget
    - DJ: 20% of budget
    - Caterer: Remaining budget (if sufficient)
  - Find vendors in each category with packages matching budget
  - Return recommendations with reasoning

#### ChatService
- Create chat thread (customer-vendor)
- Send message
- Get messages in thread
- Mark thread as read
- Get customer's chat threads

#### LeadService
- Create lead/inquiry
- Get customer's leads
- Update lead status

### 3. Vendor Services

#### VendorProfileService
- Get vendor profile
- Update vendor profile (validate category, city)
- Upload cover image (to Supabase Storage)
- Upload portfolio images
- Delete portfolio image
- Update vendor settings

#### ListingService
- **Create Package**:
  - Validate category (must match vendor category OR be 'other')
  - Validate event types (must be valid event types)
  - Validate category against event types (category must be allowed for selected event types)
  - Create listing record
  - Create add-ons if provided
  - Link event types
- **Create Individual Listing**:
  - Validate category (must match vendor category OR be 'other')
  - Validate event types
  - Validate category against event types
  - Create listing record
  - Link event types
- **Update Listing**: Similar validation as create
- **Delete Listing**: Check if listing has active orders, soft delete if needed
- **Get Listings**: Get all vendor's listings (packages + items) with filters
- **Toggle Listing Status**: Activate/deactivate listing

#### AddOnService
- Create add-on for package
- Update add-on
- Delete add-on
- Get add-ons for package

#### BookableSetupService
- Create bookable setup
- Update setup
- Delete setup
- Get setups for vendor

#### AvailabilityService
- Get availability slots (date range)
- Create/update availability slots (bulk operation)
- Update single slot
- Delete slot
- Get calendar view (next 3 months with status indicators)
- Check availability for date/time (used during order creation)

#### OrderManagementService
- Get vendor orders (with filters: status, date range)
- Get order details
- Update order status:
  - Validate status transitions
  - Update order timeline
  - Send notifications
- Confirm order
- Cancel order (vendor side):
  - Validate cancellation policy
  - Process refund if needed
  - Update availability slots
- Get upcoming orders
- Calculate order statistics:
  - Revenue by period
  - Order count by status
  - Average order value

#### LeadManagementService
- Get leads (with filters: status, date range)
- Get lead details
- Update lead status
- Create quote for lead:
  - Validate listing exists
  - Create quote record
  - Update lead status to 'quoted'
- Update quote
- Delete quote
- Convert lead to order

#### ReviewService
- Get reviews for vendor (paginated)
- Get review statistics:
  - Average rating
  - Rating distribution (1-5 stars)
  - Total review count
  - Recent reviews
- Reply to review

#### FAQService
- Get FAQs
- Create FAQ
- Update FAQ
- Delete FAQ
- Reorder FAQs (update display_order)

#### ChatService (Vendor)
- Get vendor's chat threads
- Get messages in thread
- Send message
- Mark thread as read

#### WalletService
- Get wallet balance and summary
- Get wallet transactions (paginated, with filters)
- Request withdrawal:
  - Validate minimum withdrawal amount
  - Create payout request
  - Update wallet balance (hold amount)
- Get payout history
- Process payout (admin action):
  - Update payout status
  - Update wallet balance
  - Record transaction

#### AnalyticsService
- Get dashboard statistics:
  - Upcoming bookings count
  - Pending leads count
  - Wallet balance
  - Monthly revenue
  - Recent activity
- Get revenue analytics (time range, group by period)
- Get booking analytics (count, trends, by status)
- Get leads analytics (conversion rate, by status)
- Get performance metrics (rating trends, review trends)

#### PastEventService
- Get past events
- Add past event
- Delete past event

### 4. Admin Services

#### AdminVendorService
- Get all vendors (with filters)
- Get vendor details
- Verify vendor
- Activate/deactivate vendor

#### AdminOrderService
- Get all orders (with filters)
- Get order details
- Update order status
- Process refund

#### AdminPlatformService
- Get platform-wide statistics
- Get platform revenue analytics
- Get user statistics

---

## Controller Layer - REST APIs

### Controller Organization

#### Public Controllers
- **PublicStatsController** - Platform statistics
- **PublicSearchController** - Search vendors and listings
- **PublicVendorController** - Public vendor profiles
- **PublicListingController** - Public listing details

#### Customer Controllers
- **AuthController** - Authentication (register, login, logout)
- **CartController** - Cart management
- **OrderController** - Order management
- **PaymentController** - Payment processing
- **EventPlannerController** - AI recommendations
- **ChatController** - Customer chat
- **LeadController** - Lead submission

#### Vendor Controllers
- **VendorProfileController** - Profile management
- **VendorListingController** - Listing management
- **VendorAddOnController** - Add-on management
- **VendorBookableSetupController** - Bookable setup management
- **VendorAvailabilityController** - Availability management
- **VendorOrderController** - Order management
- **VendorLeadController** - Lead management
- **VendorReviewController** - Review management
- **VendorFAQController** - FAQ management
- **VendorChatController** - Vendor chat
- **VendorWalletController** - Wallet management
- **VendorAnalyticsController** - Analytics and dashboard
- **VendorPastEventController** - Past events
- **VendorSettingsController** - Settings

#### Admin Controllers
- **AdminVendorController** - Vendor management
- **AdminOrderController** - Order management
- **AdminPlatformController** - Platform management

### Controller Responsibilities
- Validate request parameters
- Call appropriate service methods
- Handle exceptions and return appropriate HTTP status codes
- Transform service responses to DTOs
- Apply pagination, sorting, filtering

---

## DTOs & Request/Response Models

### Request DTOs

#### Authentication
- **RegisterRequest** - Customer registration
- **LoginRequest** - Login credentials
- **RefreshTokenRequest** - Refresh token

#### Cart
- **AddToCartRequest** - Add item to cart
- **UpdateCartItemRequest** - Update cart item

#### Order
- **CreateOrderRequest** - Create order from cart
- **CancelOrderRequest** - Cancel order

#### Payment
- **InitiatePaymentRequest** - Initiate payment
- **VerifyPaymentRequest** - Verify payment (webhook)

#### Event Planner
- **EventPlannerRequest** - Get recommendations (budget, eventType, guestCount)

#### Vendor Profile
- **UpdateVendorProfileRequest** - Update vendor profile
- **UploadImageRequest** - Upload image

#### Listing
- **CreatePackageRequest** - Create package
- **CreateItemRequest** - Create individual listing
- **UpdateListingRequest** - Update listing

#### Availability
- **CreateAvailabilityRequest** - Create/update availability slots

#### Lead
- **CreateLeadRequest** - Submit lead/inquiry
- **CreateQuoteRequest** - Create quote

#### Review
- **CreateReviewRequest** - Submit review
- **ReplyToReviewRequest** - Reply to review

### Response DTOs

#### Common
- **ApiResponse<T>** - Generic API response wrapper
- **PaginatedResponse<T>** - Paginated response
- **ErrorResponse** - Error response

#### Vendor
- **VendorDTO** - Vendor profile
- **VendorSummaryDTO** - Vendor summary (for lists)
- **VendorStatsDTO** - Vendor statistics

#### Listing
- **PackageDTO** - Package details
- **ItemDTO** - Individual listing details
- **ListingSummaryDTO** - Listing summary (for search results)
- **AddOnDTO** - Add-on details

#### Cart & Order
- **CartItemDTO** - Cart item
- **CartSummaryDTO** - Cart summary (subtotal, fees, total)
- **OrderDTO** - Order details
- **OrderSummaryDTO** - Order summary (for lists)
- **OrderTimelineDTO** - Order status timeline

#### Payment
- **PaymentDTO** - Payment details
- **PaymentIntentDTO** - Payment intent (for Razorpay/Stripe)

#### Review
- **ReviewDTO** - Review details
- **ReviewStatisticsDTO** - Review statistics

#### Analytics
- **DashboardStatsDTO** - Dashboard statistics
- **RevenueAnalyticsDTO** - Revenue analytics
- **BookingAnalyticsDTO** - Booking analytics

#### Lead
- **LeadDTO** - Lead details
- **QuoteDTO** - Quote details

#### Chat
- **ChatThreadDTO** - Chat thread
- **MessageDTO** - Message

#### Wallet
- **WalletDTO** - Wallet balance and summary
- **WalletTransactionDTO** - Wallet transaction
- **PayoutDTO** - Payout details

---

## Authentication & Authorization

### Authentication Strategy
- **Primary**: Supabase Auth (JWT tokens)
- **Alternative**: Spring Security with JWT (if Supabase Auth not used)

### Roles
- **CUSTOMER** - Regular customers
- **VENDOR** - Vendor users
- **ADMIN** - Platform administrators

### Authorization Rules

#### Customer Access
- Can access all public endpoints
- Can access customer-specific endpoints (cart, orders, etc.)
- Can only access their own data (cart, orders, reviews)

#### Vendor Access
- Can access all public endpoints
- Can access vendor-specific endpoints
- Can only access their own vendor profile and data
- Cannot access other vendors' management endpoints

#### Admin Access
- Can access all endpoints
- Can manage vendors, orders, platform settings

### Security Implementation
- JWT token validation on all authenticated endpoints
- Role-based access control (RBAC)
- Method-level security annotations
- CORS configuration for frontend domain
- Rate limiting for API endpoints
- Input validation and sanitization

---

## Validation & Error Handling

### Validation Requirements

#### Input Validation
- All request DTOs must be validated using Bean Validation annotations
- Custom validators for:
  - Email format
  - Phone number format
  - Date ranges (event date must be future)
  - Price ranges (must be positive)
  - Category validation (must be valid category)
  - Event type validation (must be valid event type)
  - Listing category validation (must match vendor category OR be 'other')

#### Business Rule Validation
- Listing category must match vendor category OR be 'other'
- Event type → category validation (category must be allowed for event type)
- Availability validation (date/time must be available)
- Order cancellation policy validation
- Withdrawal minimum amount validation
- Package must have at least one event type
- Listing must have at least one event type

### Error Handling

#### Exception Hierarchy
- **BaseException** - Base exception class
- **ValidationException** - Validation errors
- **NotFoundException** - Resource not found
- **UnauthorizedException** - Unauthorized access
- **ForbiddenException** - Forbidden access
- **BusinessRuleException** - Business rule violations
- **PaymentException** - Payment processing errors

#### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2024-12-02T10:30:00Z"
  }
}
```

#### Global Exception Handler
- Handle all exceptions
- Return appropriate HTTP status codes
- Log errors for debugging
- Return user-friendly error messages

---

## Background Jobs & Scheduled Tasks

### Scheduled Tasks

#### Daily Tasks
1. **Update Vendor Ratings** - Recalculate vendor ratings from reviews
2. **Update Listing Popularity** - Update is_popular and is_trending flags
3. **Send Reminder Emails** - Send reminders for upcoming events
4. **Process Payouts** - Process pending payout requests
5. **Cleanup Expired Carts** - Remove cart items older than 7 days

#### Weekly Tasks
1. **Generate Analytics Reports** - Generate weekly analytics for vendors
2. **Send Weekly Summary Emails** - Send weekly summaries to vendors

#### Monthly Tasks
1. **Generate Monthly Reports** - Generate monthly reports for vendors and platform
2. **Archive Old Data** - Archive old orders, messages, etc.

### Background Jobs

#### Async Processing
- **Email Sending** - Send emails asynchronously (order confirmations, notifications)
- **Image Processing** - Process uploaded images (resize, optimize)
- **Payment Webhooks** - Process payment webhooks asynchronously
- **Analytics Calculation** - Calculate analytics asynchronously

---

## Integration Points

### External Services

#### Supabase
- **Database**: PostgreSQL connection
- **Storage**: Image/video uploads
- **Auth**: User authentication (if using Supabase Auth)

#### Payment Gateways
- **Razorpay**: Primary payment gateway (India)
- **Stripe**: Alternative payment gateway (international)
- Integration requirements:
  - Create payment intent
  - Verify payment (webhook)
  - Process refunds
  - Handle payment failures

#### Email Service
- **SendGrid** or **AWS SES**: Transactional emails
- Email types:
  - Order confirmations
  - Payment receipts
  - Booking reminders
  - Lead notifications
  - Review requests

#### SMS Service (Optional)
- **Twilio** or **AWS SNS**: SMS notifications
- SMS types:
  - OTP for login
  - Booking confirmations
  - Payment confirmations

### Internal Integrations

#### Frontend Integration
- REST API endpoints for all frontend features
- WebSocket support for real-time chat (optional)
- Server-Sent Events (SSE) for notifications (optional)

---

## Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- Validation logic
- Exception handling

### Integration Tests
- Repository layer (database queries)
- Controller layer (API endpoints)
- Service layer integration
- Payment gateway integration (mock)

### API Tests
- All REST endpoints
- Authentication and authorization
- Error scenarios
- Edge cases

### Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage for critical business logic
- All API endpoints tested

---

## Performance & Optimization

### Database Optimization
- Indexes on frequently queried columns:
  - `vendors.category_id`
  - `listings.vendor_id`
  - `listings.listing_category_id`
  - `listings.type`
  - `orders.user_id`
  - `orders.vendor_id`
  - `orders.status`
  - `orders.event_date`
- Query optimization:
  - Use JOINs efficiently
  - Avoid N+1 queries
  - Use pagination for large datasets
  - Cache frequently accessed data

### Caching Strategy
- **Redis** (optional): Cache frequently accessed data
  - Vendor profiles
  - Category/event type mappings
  - Platform statistics
- Cache invalidation on data updates

### API Optimization
- Pagination for list endpoints
- Field selection (return only required fields)
- Compression for large responses
- Rate limiting

---

## Security Considerations

### Data Security
- Encrypt sensitive data (payment info, personal data)
- Use parameterized queries (prevent SQL injection)
- Input sanitization
- XSS prevention

### API Security
- HTTPS only
- JWT token expiration
- Refresh token rotation
- Rate limiting
- CORS configuration

### Payment Security
- Never store full card details
- Use payment gateway tokens
- PCI DSS compliance (via payment gateway)
- Secure webhook endpoints

---

## Deployment & DevOps

### Build & Deployment
- Maven build process
- Docker containerization
- Docker Compose for local development
- CI/CD pipeline (GitHub Actions/GitLab CI)

### Environment Configuration
- Development environment
- Staging environment
- Production environment
- Environment-specific configuration files

### Monitoring & Logging
- Application logging (SLF4J + Logback)
- Error tracking (Sentry or similar)
- Performance monitoring
- Database query monitoring

### Backup & Recovery
- Database backup strategy
- Regular backups
- Disaster recovery plan

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Project setup and configuration
- Database connection and entity models
- Basic authentication
- Repository layer
- Basic CRUD operations

### Phase 2: Public APIs (Week 3-4)
- Public search endpoints
- Vendor public profiles
- Listing details
- Platform statistics

### Phase 3: Customer Features (Week 5-6)
- Cart management
- Order creation
- Payment integration
- Event planner

### Phase 4: Vendor Features (Week 7-9)
- Vendor profile management
- Listing management
- Order management
- Lead management
- Analytics

### Phase 5: Advanced Features (Week 10-11)
- Chat system
- Wallet and payouts
- Reviews and FAQs
- Availability management

### Phase 6: Testing & Optimization (Week 12)
- Comprehensive testing
- Performance optimization
- Security audit
- Documentation

---

## Success Criteria

### Functional Requirements
- All API endpoints implemented and tested
- All user journeys supported
- All business rules enforced
- Payment integration working
- Email notifications working

### Non-Functional Requirements
- API response time < 500ms (95th percentile)
- 99.9% uptime
- Secure and compliant
- Well-documented
- Scalable architecture

---

## Notes & Considerations

### Critical Business Rules to Implement
1. **Strict Filtering**: Event Type → Category → Listing (must be strictly enforced)
2. **Category Validation**: Listings must match vendor category OR be 'other'
3. **Event Type Validation**: Category must be allowed for selected event types
4. **Cart Calculation**: Platform fee (5%) + GST (18%) on subtotal
5. **Order Status Flow**: pending → confirmed → in-progress → completed
6. **Payment Protection**: Payment held until service completion
7. **Vendor Payout**: Vendors receive subtotal (before platform fee and GST)

### Future Enhancements
- Real-time chat (WebSocket)
- Push notifications
- Mobile app APIs
- Advanced analytics
- AI-powered recommendations (ML model)
- Multi-language support
- International payment gateways

---

**End of Backend Implementation Plan**

