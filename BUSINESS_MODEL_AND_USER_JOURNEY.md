# Event Hub Connect - Complete Business Model & User Journey Documentation

> **Last Updated**: December 2024  
> **Status**: MVP Development Phase - Frontend Complete, Backend in Progress

## Recent Major Changes
- ✅ **Project Restructuring**: Separated frontend and backend into distinct directories with feature-based frontend architecture
- ✅ **Unified Listings Tab**: Consolidated "Packages" and "Listings" tabs into single "Listings" tab in vendor profile
- ✅ **Strict Filtering Logic**: Implemented hierarchical filtering (Event Type → Category → Listing) with strict validation
- ✅ **Multi-Event Type Support**: Vendors can now select multiple event types for each listing/package
- ✅ **UI Improvements**: Enhanced package/listing differentiation, modal views, and card styling
- ✅ **Database Schema**: Created PostgreSQL schema with separate `packages` and `listings` tables
- ✅ **Supabase Integration**: Configured Supabase for database, storage, and auto-generated APIs
- ✅ **Docker Setup**: Containerized both frontend and backend services
- ✅ **Image Storage**: Implemented frontend-only image upload to Supabase Storage

## Table of Contents
1. [Business Model Overview](#business-model-overview)
2. [Revenue Streams](#revenue-streams)
3. [Value Propositions](#value-propositions)
4. [Target Market](#target-market)
5. [Complete User Journey](#complete-user-journey)
6. [Detailed Feature Breakdown](#detailed-feature-breakdown)
7. [Technical Implementation Details](#technical-implementation-details)

---

## Business Model Overview

### Platform Type
**Event Hub Connect** is a **B2C marketplace platform** that connects event organizers (customers) with verified event service providers (vendors). The platform operates as an intermediary, facilitating transactions between customers and vendors while providing value-added services.

### Core Business Model
- **Marketplace Model**: Two-sided platform connecting supply (vendors) and demand (customers)
- **Commission-Based Revenue**: Platform earns revenue through transaction fees
- **Multi-Vendor Booking**: Customers can book multiple vendors in a single transaction
- **Transparent Pricing**: Fixed pricing model with clear add-on options
- **Flexible Listing Options**: Vendors can create both packages (bundled services) and individual listings (single items like chairs, tables, equipment, etc.)

### Key Differentiators
1. **Multi-Vendor Single Checkout**: Book all event vendors in one transaction
2. **Fixed Pricing**: No hidden costs, transparent package pricing
3. **Real-Time Availability**: Live calendar integration for instant booking
4. **Book Exact Setups**: Customers can book specific setups they see in portfolios
5. **AI-Powered Recommendations**: Budget-based vendor recommendations
6. **Verified Vendors**: All vendors are verified and rated

---

## Revenue Streams

### 1. Platform Commission Fee
- **Rate**: 5% of transaction value
- **Calculation**: Applied to subtotal (sum of all package prices + add-ons + customizations)
- **Example**: If subtotal is ₹100,000, platform fee = ₹5,000

### 2. Government Tax (GST)
- **Rate**: 18% of subtotal
- **Type**: Goods and Services Tax (Indian tax system)
- **Calculation**: Applied to subtotal
- **Example**: If subtotal is ₹100,000, GST = ₹18,000

### 3. Total Customer Payment Structure
```
Subtotal (Package prices + Add-ons + Customizations) = ₹100,000
Platform Fee (5%) = ₹5,000
GST (18%) = ₹18,000
─────────────────────────────────
Total Amount = ₹123,000
```

### 4. Vendor Payout Structure
- Vendors receive: **Subtotal amount** (before platform fee and GST)
- Platform retains: **5% commission**
- GST is collected from customer and remitted to government

### 5. Additional Revenue Opportunities (Future)
- **Premium Listings**: Vendors pay for featured placement
- **Advertising**: Banner ads and sponsored listings
- **Subscription Plans**: Premium vendor memberships
- **Lead Generation**: Pay-per-lead model for vendors

---

## Value Propositions

### For Customers
1. **One-Stop Solution**: Find and book all event vendors in one place
2. **Transparent Pricing**: No hidden costs, clear package breakdowns
3. **Verified Vendors**: All vendors are verified with ratings and reviews
4. **Easy Comparison**: Compare multiple vendors side-by-side
5. **Secure Payments**: Payment protection and refund guarantees
6. **Instant Booking**: Real-time availability and immediate confirmation
7. **Customization**: Add-ons and package customization options
8. **Budget Planning**: AI-powered recommendations based on budget

### For Vendors
1. **Increased Visibility**: Access to large customer base
2. **Lead Generation**: Qualified leads from customers actively looking to book
3. **Payment Security**: Guaranteed payments through platform
4. **Portfolio Showcase**: Professional portfolio display
5. **Review System**: Build reputation through customer reviews
6. **Analytics**: Track bookings and performance metrics
7. **Reduced Marketing Costs**: Platform handles customer acquisition
8. **Flexible Listing Options**: Can create both packages (bundled services) and individual listings (single items like chairs, tables, etc.)

---

## Target Market

### Primary Customers
- **Event Organizers**: Individuals planning personal events
- **Wedding Planners**: Professional planners coordinating weddings
- **Corporate Event Managers**: Companies organizing corporate events
- **Family Members**: Planning celebrations for family

### Event Types Served
1. **Weddings**: Complete wedding planning services
2. **Birthdays**: Birthday party vendors
3. **Corporate Events**: Business meetings, conferences, seminars
4. **Anniversaries**: Anniversary celebration services
5. **Engagements**: Pre-wedding event services
6. **Baby Showers**: Baby shower planning
7. **Other**: Any custom event type

### Vendor Categories (12 Categories)
1. **Photography** 📸
2. **Cinematography** 🎬
3. **Décor** 🎨
4. **DJ** 🎵
5. **Sound & Lights** 💡
6. **Makeup / Stylist** 💄
7. **Catering** 🍽️
8. **Return Gifts** 🎁
9. **Invitations** ✉️
10. **Live Music** 🎤
11. **Anchors** 🎙️
12. **Event Coordinators** 📋

### Geographic Coverage
- **Primary Cities**: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad
- **Coverage Radius**: Vendor-specific (ranges from 50km to 200km)

---

## Complete User Journey

### Phase 1: Discovery & Awareness

#### 1.1 Landing Page (Home Page)
**URL**: `/`

**Page Elements:**
- **MinimalNavbar Component** (Fixed at top)
  - Logo: "EventHub" (clickable, links to home)
  - Navigation Links:
    - Home (current page)
    - Vendors (links to `/search`)
    - Event Types (links to `/search`)
    - About (links to `/about`)
  - Search Icon Button (links to `/search`)
  - Shopping Cart Icon with Badge (shows item count, links to `/cart`)
  - Login Button (links to `/login`)
  - Mobile Menu Toggle (hamburger icon)

- **CinematicHero Component** (Full viewport hero section)
  - Background: Dynamic event imagery with gradient overlay
  - Main Headline: "BOOK EVENT VENDORS" (animated)
  - Alternating Subheadlines (5-second intervals):
    - "Find All Your Event Vendors" with category list
    - "Plan Your Complete Event Experience" with value proposition
  - Primary CTAs:
    - "Browse Categories" Button (links to `/search`)
    - "Start Planning Now" Button (links to `/event-planner`)

- **Stats Bar** (Floating card above next section)
  - 4 Statistics Cards:
    - 500+ Verified Vendors (Users icon, blue)
    - 10K+ Events Completed (Award icon, purple)
    - 4.8 Average Rating (Star icon, yellow)
    - 98% Satisfaction Rate (TrendingUp icon, green)

- **InteractiveEventShowcase Component**
  - Event type cards (Wedding, Birthday, Corporate, etc.)
  - Each card clickable, navigates to `/search?eventType={type}`

- **FuturisticCategoryCarousel Component**
  - Horizontal scrolling carousel of 12 vendor categories
  - Each category card clickable, navigates to `/search?category={categoryId}`

- **Trending Setups Section**
  - Auto-rotating carousel (5-second intervals)
  - Shows bookable setups from vendors
  - Navigation arrows (left/right)
  - Progress indicators (dots at bottom)
  - Each card shows:
    - Setup image
    - Title and description
    - Vendor name and city
    - Price
    - "Book This Setup" button (links to `/vendor/{vendorId}`)

- **Featured Vendors Section**
  - Grid of 6 premium vendor cards
  - Each card shows:
    - Cover image
    - Business name
    - Category badge
    - Rating and review count
    - Starting price
    - "View Details" button (links to `/vendor/{vendorId}`)
  - "View All Vendors" button (links to `/search`)

- **How It Works Section**
  - 3-step process cards:
    1. Browse & Discover (Sparkles icon)
    2. Customize & Book (Zap icon)
    3. Pay & Confirm (CheckCircle2 icon)

- **Footer**
  - Company info and social links
  - Links: For Customers, For Vendors, Support sections
  - Legal links: Terms, Privacy, Cookies

**User Actions:**
- Click "Browse Categories" → Navigate to Search page
- Click "Start Planning Now" → Navigate to Event Planner
- Click any event type → Navigate to Search with eventType filter
- Click any category → Navigate to Search with category filter
- Click "Book This Setup" → Navigate to Vendor Details
- Click "View Details" on vendor → Navigate to Vendor Details
- Click Cart icon → Navigate to Cart page
- Click Login → Navigate to Login page

---

### Phase 2: Search & Discovery

#### 2.1 Search Page
**URL**: `/search` or `/search?eventType={type}&category={cat}&listingType={type}&city={city}&q={query}`

**Page Elements:**
- **Navbar Component**
  - Same navigation as home page
  - Cart icon with item count
  - Login button

- **Search Header Section**
  - Title: "Explore {EventType} Packages" (if eventType present) or "Find Your Perfect Vendors"
  - Search Bar (if eventType present):
    - Search input field (placeholder: "Search packages...")
    - Search icon
    - Filters button (SlidersHorizontal icon)
  - Full Search Form (if no eventType):
    - Search input (placeholder: "Search vendors...")
    - Search button
    - Filters button

- **Category Tabs** (Only shown when eventType is present)
  - "All Categories" button (📦 icon) - selected by default, shows all listings
  - Horizontal scrollable category buttons (only shows categories that have items for the selected event type)
  - Left/Right scroll arrows (appear when scrollable)
  - Each category button shows:
    - Category icon (emoji)
    - Category name
    - Active state (highlighted when selected)
  - Clicking active category deselects it (toggle behavior, returns to "All Categories")
  - **Important**: Only categories that have items matching the event type are shown

- **Listing Type Filter** (Only shown when eventType is present)
  - Filter chips: "All Listings" (default) and "Packages Only"
  - "All Listings" shows both packages and individual listings (4 cards per row)
  - "Packages Only" shows only bundled packages using PremiumPackageCard style (3 cards per row)
  - Defaults to "All Listings" to show everything
  - Updates URL parameter `listingType`

- **Filters Panel** (Expandable card)
  - Listing Type dropdown (if eventType present): "All Listings" or "Packages Only"
  - Category dropdown
  - City dropdown
  - Min Budget input
  - Max Budget input
  - "Clear Filters" button

- **Sort & Results Count**
  - Results count: "Found X listing(s)" or "Found X package(s)" or "Found X vendor(s)"
  - Sort dropdown (if eventType present):
    - Relevance
    - Price: Low to High
    - Price: High to Low
    - Rating
    - Vendor

- **Results Grid**
  - **Package/Listing View** (if eventType present):
    - **All Listings Mode** (listingType='all' or not set):
      - Grid layout: `lg:grid-cols-4` with `gap-4`
      - Uses `PackageCard` component for all items
      - **Packages**: Styled with taller images, gradient "Package" badge, primary border, larger text/price, enhanced hover effects
      - **Individual Listings**: Standard styling with green "Individual Listing" badge
      - Clicking "Details" on a package opens a modal with `PremiumPackageCard` (blurred background)
    - **Packages Only Mode** (listingType='packages'):
      - Grid layout: `lg:grid-cols-3` with `gap-4`
      - Uses `PremiumPackageCard` component (same style as vendor profile)
      - Shows only packages, not individual listings
    - Each card shows:
      - Package/Listing image
      - Package/Listing name
      - Vendor name
      - Category badge
      - "Package" badge (for packages) or "Individual Listing" badge (for listings)
      - "Popular" or "Trending" badges (if applicable, positioned to avoid overlap)
      - Price
      - Rating
      - Included items (for packages only)
      - "View Details" button (links to `/vendor/{vendorId}?tab=listings&packageId={id}`)
  
  - **Vendor View** (if no eventType):
    - Grid of VendorCard components
    - Each card shows:
      - Cover image
      - Business name
      - Category
      - Rating and reviews
      - Starting price
      - City
      - "View Details" button (links to `/vendor/{vendorId}`)

**Filtering Logic (CRITICAL - Event Type → Category → Listing):**
1. **Event Type Filter** (First Level - Applied in `flattenPackages`):
   - If `eventType` is provided, items MUST have `eventTypes` array
   - Items without `eventTypes` are excluded
   - Items must explicitly include the selected `eventType` in their `eventTypes` array
   - **Strict Rule**: No fallback - items without matching event type are excluded

2. **Event Type → Category Validation** (Second Level - Applied in `filteredAndSortedPackages`):
   - If `eventType` is present, item's category must be in `eventTypeCategories[eventType]`
   - This prevents items from appearing in event types where their category is not relevant
   - Example: "Hair Styling Service" (category: 'mua') won't appear in "Birthday" event if 'mua' is not in Birthday's allowed categories

3. **Category Filter** (Third Level - Applied in `filteredAndSortedPackages`):
   - Filters by **ITEM category** (`package.category` or `listing.category`), NOT vendor category
   - **Strict Rule**: Exact match required - `item.category === selectedCategory`
   - For packages: Uses `package.category || vendor.category` (package category takes precedence)
   - For listings: Uses `listing.category` (explicit, required)
   - Items without category are excluded
   - When "All Categories" is selected, category filter is not applied

4. **Listing Type Filter**:
   - "All Listings": Shows both packages and individual listings
   - "Packages Only": Shows only packages (type: 'package')

**User Actions:**
- Type in search bar → Filters results in real-time
- Click "All Categories" → Removes category filter, shows all listings
- Click category tab → Filters by category (strict match), updates URL, uses `flushSync` for immediate state update
- Click listing type filter → Filters between "All Listings" and "Packages Only", updates URL
- Click Filters button → Expands/collapses filter panel
- Select filters → Updates results immediately (no refresh needed)
- Click "Clear Filters" → Resets all filters
- Select sort option → Reorders results
- Click "View Details" → Navigate to Vendor Details page
- Click "Details" on package → Opens modal with `PremiumPackageCard` (blurred background)

---

### Phase 3: Vendor Details & Package Selection

#### 3.1 Vendor Details Page
**URL**: `/vendor/{vendorId}` or `/vendor/{vendorId}?tab={tab}&packageId={id}`

**Page Elements:**
- **Navbar Component** (same as before)

- **Hero Section** (Top of page)
  - Vendor cover image (full width, 500px height)
  - Gradient overlay (dark to transparent)
  - Vendor info overlay:
    - Category badge
    - Business name (large, bold)
    - Location (MapPin icon + city + coverage radius)
    - Rating (Star icon + rating + review count)
  - "Chat Now" button (opens chat dialog)

- **Main Content Area** (Grid layout: 2/3 + 1/3 sidebar)

- **Tabs Navigation** (5 tabs)
  1. **Overview Tab** (default)
     - About section card:
       - Vendor bio/description
     - Book Exact Setup section (if available):
       - Grid of BookExactSetup cards
       - Each card shows:
         - Setup image
         - Title and description
         - Category badge
         - Price
         - "View Details" button (links to Listings tab)
         - "Add to Cart" button (adds setup to cart)
     - Past Events section (if available):
       - Grid of past event images
       - Each shows event type and date

  2. **Listings Tab** (CONSOLIDATED - Replaces separate Packages and Listings tabs)
     - Header: "All Listings" + total count (packages + individual listings)
     - **Packages Section** (Top):
       - Sub-header: "Packages" + package count
       - Grid layout: `lg:grid-cols-2` with `gap-6`
       - Uses `PremiumPackageCard` component (same style as before)
       - Each package card shows:
         - Package image with "Package" badge (gradient, rounded-full, top-left)
         - Category name badge (white/translucent, below Package badge)
         - Package name
         - Price badge (large, rounded-full, strong shadow)
         - Description
         - Included items list (checkmarks)
         - Excluded items list (X marks)
         - Delivery time
         - Extra charges info
         - Add-ons section (if available)
         - "Customize Package" button (opens customization dialog)
         - "Add to Cart" button
       - If packageId in URL, that package is highlighted and others are dimmed
       - "Show Other Packages" button appears on highlighted package
     
     - **Individual Listings Section** (Bottom):
       - Sub-header: "Individual Listings" + listing count
       - Grid of custom listing cards
       - Each listing card shows:
         - Listing image
         - Listing name
         - Price (large, bold)
         - Unit (per piece, per set, etc.)
         - Description
         - Minimum quantity (if applicable)
         - "Add to Cart" button
       - Shows only listings that match vendor's category or are in "Other" category
       - Empty state if no listings available
     
     - **Important**: Packages appear first, then individual listings, maintaining original package card styling

  3. **Portfolio Tab**
     - Grid of portfolio images
     - Hover effect: Image scales up, overlay appears

  4. **Reviews Tab**
     - List of review cards
     - Each review shows:
       - User avatar (initial)
       - User name
       - Star rating (visual stars)
       - Event type badge
       - Comment text
       - Date

  5. **FAQs Tab**
     - Accordion component
     - Expandable Q&A pairs

- **Sidebar** (Sticky, right side)
  - Quick Info card:
    - Starting Price (large, bold)
    - Location (city + coverage radius)
    - Category badge
    - "Chat with Vendor" button (opens chat dialog)
  - AvailabilityCalendar component:
    - Calendar view (next 3 months)
    - Date slots with time availability
    - Color coding:
      - Green: Available
      - Yellow: Busy
      - Red: Booked
    - Clicking slot selects date/time
    - Selected slot highlighted

**User Actions:**
- Click "Chat Now" → Opens PremiumChatWindow dialog
- Click tab → Switches tab content, updates URL
- Click "View Details" on setup → Navigates to Listings tab with packageId
- Click "Add to Cart" on setup → Adds to cart, shows toast notification
- Click "Customize Package" → Opens PackageCustomization dialog
- Click "Add to Cart" on package → Adds to cart, shows toast
- Click "Add to Cart" on listing → Adds to cart, shows toast
- Click date/time slot → Selects for booking
- Click portfolio image → View full-size (if implemented)
- Expand FAQ accordion → Shows answer

---

### Phase 4: Package Customization

#### 4.1 Package Customization Dialog
**Triggered from**: "Customize Package" button on Vendor Details page

**Dialog Elements:**
- **Base Package Section**
  - Package name
  - Base price (displayed)

- **Add-ons Section**
  - List of available add-ons
  - Each add-on shows:
    - Checkbox (toggle selection)
    - Add-on title
    - Description (if available)
    - Price badge (+₹X)
  - Checkbox to select/deselect add-ons

- **Customization Options Section**
  - Dynamic options based on package type:
    - Photography packages: "Photography Hours" slider/buttons
      - Minus button (decrease hours)
      - Current hours display
      - Plus button (increase hours)
      - Price adjustment shown
    - DJ packages: "DJ Hours" slider/buttons
      - Same interaction as photography hours

- **Total Price Display**
  - Base price + Add-ons + Customizations
  - Large, bold, primary color

- **Apply Customizations Button**
  - Applies selections and closes dialog
  - Updates package card with customizations

**User Actions:**
- Check/uncheck add-on → Updates total price
- Click minus/plus for hours → Adjusts hours and price
- Click "Apply Customizations" → Saves selections, closes dialog
- Click outside dialog → Closes without saving

---

### Phase 5: Cart Management

#### 5.1 Cart Page
**URL**: `/cart`

**Page Elements:**
- **Navbar Component**

- **Page Title**: "Shopping Cart"

- **Cart Items Section** (Left, 2/3 width)
  - List of CartItem cards
  - Each item card shows:
    - Package name (bold, large)
    - Vendor name (small, muted)
    - Event date/time (if selected)
    - Add-ons list (badges with prices)
    - Customizations list (badges with values and prices)
    - Quantity controls:
      - Minus button
      - Quantity number
      - Plus button
    - Price (total for quantity)
    - Delete button (Trash2 icon)
  - Empty state (if cart is empty):
    - Shopping cart icon
    - "Your cart is empty" message
    - "Browse Vendors" button (links to `/search`)

- **Order Summary Card** (Right, 1/3 width, sticky)
  - Subtotal: Sum of all items
  - Platform Fee: 5% of subtotal
  - GST: 18% of subtotal
  - Total: Subtotal + Platform Fee + GST
  - "Proceed to Checkout" button (links to `/checkout`)
  - "Clear Cart" button (removes all items)
  - Trust badges:
    - ✓ Secure payment processing
    - ✓ Refund protection included
    - ✓ Instant booking confirmation

**User Actions:**
- Click minus/plus → Updates quantity
- Click delete → Removes item from cart
- Click "Proceed to Checkout" → Navigate to Checkout page
- Click "Clear Cart" → Removes all items
- Click "Browse Vendors" → Navigate to Search page

---

### Phase 6: Checkout & Payment

#### 6.1 Checkout Page
**URL**: `/checkout`

**Page Elements:**
- **Navbar Component**

- **Page Title**: "Secure Checkout"

- **Payment Form Section** (Left, 2/3 width)
  - Payment Protection Info card:
    - Shield icon
    - Protection features list:
      - Payment held securely until service completion
      - Full refund if vendor cancels
      - Dispute resolution support
      - 100% money-back guarantee

  - Payment Method card:
    - Radio button group:
      - Credit/Debit Card option
        - CreditCard icon
        - Card details form (if selected):
          - Card Number input
          - Cardholder Name input
          - Expiry Date input (MM/YY)
          - CVV input (password type)
      - UPI option
        - Lock icon
        - UPI ID input (if selected)

  - Booking Summary card:
    - List of cart items
    - Each shows:
      - Package name
      - Vendor name
      - Price (with quantity if > 1)

- **Order Summary Card** (Right, 1/3 width, sticky)
  - Same structure as Cart page
  - Subtotal
  - Platform Fee (5%)
  - GST (18%)
  - Total (large, bold, primary color)
  - "Pay Securely ₹X" button:
    - Lock icon
    - Shows total amount
    - Disabled if processing or cart empty
    - Shows "Processing..." when clicked
  - Trust indicators:
    - SSL Encrypted
    - Refund Protection
    - Instant Confirmation

**User Actions:**
- Select payment method → Shows relevant form
- Enter card details → Validates input
- Enter UPI ID → Validates format
- Click "Pay Securely" → Processes payment:
  - Shows "Processing..." state
  - Simulates 2-second delay
  - Shows success toast
  - Clears cart
  - Navigates to Booking Success page

---

### Phase 7: Booking Confirmation

#### 7.1 Booking Success Page
**URL**: `/booking-success`

**Page Elements:**
- **Navbar Component**

- **Success Card** (Centered, max-width)
  - CheckCircle2 icon (large, green, in circle)
  - Title: "Booking Confirmed!"
  - Description: Confirmation message
  - Info sections:
    - Confirmation Email (Mail icon)
      - "Sent to your registered email address"
    - Vendor Confirmations (Calendar icon)
      - "Vendors will confirm within 24 hours"
  - Action buttons:
    - "Browse More Vendors" (outline, links to `/search`)
    - "Back to Home" (primary, links to `/`)

**User Actions:**
- Click "Browse More Vendors" → Navigate to Search page
- Click "Back to Home" → Navigate to Home page

---

### Phase 8: Event Planner (Alternative Journey)

#### 8.1 Event Planner Page
**URL**: `/event-planner`

**Page Elements:**
- **Navbar Component**

- **Header Section**
  - Sparkles icon + "Event Planner" title
  - Description: "Tell us your budget and event details..."

- **Form Section** (If no results shown)
  - Total Budget input (number, placeholder: "e.g., 200000")
  - Event Type dropdown (all event types)
  - Number of Guests input (number, placeholder: "e.g., 100")
  - "Get Recommendations" button (Sparkles icon)

- **Results Section** (If recommendations generated)
  - Recommended Vendors card:
    - Header: "Recommended Vendors" + Budget badge
    - List of recommendation cards:
      - Category badge
      - Vendor name
      - Package name
      - Reason for recommendation
      - Price (large, primary color)
      - "View Details" button (links to vendor page)
  - Total Cost card:
    - Total cost (large, bold)
    - Remaining budget calculation
    - "Within Budget" indicator (CheckCircle2 icon)
    - "Add All to Cart" button (ShoppingCart icon)
    - "Start Over" button (resets form)

**User Actions:**
- Enter budget, event type, guest count → Enables "Get Recommendations"
- Click "Get Recommendations" → Generates AI recommendations:
  - Decorator (30% of budget)
  - Photographer (25% of budget)
  - DJ (20% of budget)
  - Caterer (if budget allows)
- Click "View Details" → Navigate to Vendor Details
- Click "Add All to Cart" → Adds all recommendations to cart, navigates to Cart
- Click "Start Over" → Resets form and results

---

### Phase 9: Authentication

#### 9.1 Login Page
**URL**: `/login`

**Page Elements:**
- Centered card (max-width)
- EventHub logo (gradient text)
- Title: "Welcome Back"
- Description: "Enter your credentials..."
- Form:
  - Email input
  - Password input
  - "Sign In" button
- Link: "Don't have an account? Sign up" (links to `/signup`)

**User Actions:**
- Enter email/password → Validates
- Click "Sign In" → Shows success toast, navigates to home
- Click "Sign up" link → Navigate to Signup page

#### 9.2 Signup Page
**URL**: `/signup`

**Page Elements:**
- Same layout as Login
- Title: "Create Account"
- Description: "Sign up to start booking..."
- Form:
  - Full Name input
  - Email input
  - Password input
  - Confirm Password input
  - Checkbox: "I want to register as a vendor"
  - "Create Account" button
- Link: "Already have an account? Sign in" (links to `/login`)

**User Actions:**
- Enter details → Validates password match
- Check vendor checkbox → Sets vendor registration mode
- Click "Create Account" → Shows success toast:
  - If vendor checked: Navigates to `/vendor/onboarding`
  - If customer: Navigates to home

---

## Detailed Feature Breakdown

### 1. Multi-Vendor Cart System
- **Purpose**: Allow customers to book multiple vendors in one transaction
- **Implementation**: 
  - CartContext manages cart state globally
  - Each cart item includes: vendor info, package info, add-ons, customizations, quantity, date/time
  - Cart persists during session
- **User Flow**: Add items → Review in cart → Single checkout → One payment

### 2. Package Customization
- **Purpose**: Allow customers to customize packages with add-ons and options
- **Features**:
  - Pre-defined add-ons (checkboxes)
  - Dynamic customizations (hours, quantities)
  - Real-time price calculation
- **User Flow**: Select package → Click customize → Choose add-ons/options → Apply → Add to cart

### 3. Real-Time Availability Calendar
- **Purpose**: Show vendor availability and allow date/time selection
- **Features**:
  - 3-month calendar view
  - Time slots per day
  - Status indicators (available/busy/booked)
  - Click to select date/time
- **User Flow**: View calendar → Select date → Select time → Date/time saved for booking

### 4. Book Exact Setup Feature
- **Purpose**: Allow customers to book specific setups they see in portfolios
- **Features**:
  - Setup cards with images
  - Direct booking option
  - Links to related package
- **User Flow**: Browse setups → Click "Book This Setup" → Add to cart or view details

### 5. AI-Powered Event Planner
- **Purpose**: Recommend vendors based on budget and event details
- **Algorithm**:
  - Decorator: 30% of budget
  - Photographer: 25% of budget
  - DJ: 20% of budget
  - Caterer: Remaining budget (if sufficient)
- **User Flow**: Enter budget/details → Get recommendations → Review → Add all to cart

### 6. Search & Filter System
- **Purpose**: Help customers find relevant vendors/packages/listings
- **Filtering Flow**: **Event Type → Category → Listing** (strict hierarchical filtering)
- **Filters**:
  - **Event Type** (First Level):
    - User selects event type (e.g., "Wedding", "Corporate")
    - Items MUST have `eventTypes` array and MUST include the selected event type
    - Items without `eventTypes` are excluded when event type filter is active
    - **Strict Rule**: No fallback - items must explicitly match event type
  - **Category** (Second Level):
    - Filters by **ITEM category** (`package.category` or `listing.category`), NOT vendor category
    - **Strict Rule**: Exact match required - `item.category === selectedCategory`
    - For packages: Uses `package.category || vendor.category` (package category takes precedence)
    - For listings: Uses `listing.category` (explicit, required)
    - "All Categories" option removes category filter
    - Only categories with items for the selected event type are shown
  - **Event Type → Category Validation**:
    - Item's category must be in `eventTypeCategories[eventType]`
    - Prevents items from appearing in event types where their category is not relevant
  - **Listing Type** (All Listings / Packages Only) - defaults to "All Listings"
    - "All Listings": Shows both packages and individual listings (4 cards per row, uses `PackageCard`)
    - "Packages Only": Shows only packages (3 cards per row, uses `PremiumPackageCard`)
  - City
  - Budget range
  - Search query
- **Sort Options**: Relevance, Price (low/high), Rating, Vendor
- **User Flow**: Select event type → Select category → View results → Refine with listing type/filters → Select vendor/package/listing
- **State Management**: Uses `flushSync` for immediate state updates, dynamic React keys to prevent stale data carryover
- **Note**: Vendors can create both packages (bundled services) and individual listings (single items)

### 7. Vendor Verification & Reviews
- **Purpose**: Build trust and help customers make decisions
- **Features**:
  - Vendor ratings (0-5 stars)
  - Review count
  - Individual reviews with:
    - User name and avatar
    - Rating
    - Comment
    - Event type
    - Date
- **User Flow**: View vendor → Check rating → Read reviews → Make decision

### 8. Chat System
- **Purpose**: Allow direct communication with vendors
- **Features**:
  - PremiumChatWindow component
  - Opens in dialog
  - Vendor-specific chat
- **User Flow**: Click "Chat Now" → Dialog opens → Send messages → Close dialog

### 11. Category-Based Listing System
- **Purpose**: Ensure listings are properly categorized and vendors can only list relevant items
- **Features**:
  - Vendors can only create listings in their own category or "Other" category
  - Category validation prevents mis-categorization (e.g., photographer cannot list food plates)
  - Automatic category suggestion based on listing name/description
  - "Other" category for miscellaneous items that don't fit specific categories
  - Listings displayed in vendor profile under consolidated "Listings" tab (packages + individual listings)
  - Vendors can select multiple event types for each listing/package
- **Category Rules**:
  - **Vendor Category**: Vendor's primary business category (e.g., "photographer")
  - **Item Category**: Each package/listing has its own category
    - For packages: `package.category` is optional, defaults to `vendor.category`
    - For listings: `listing.category` is required, must be `vendor.category` OR `'other'`
  - System suggests correct category if vendor tries to list outside their category
  - Example: If photographer tries to list "Food Plates", system suggests "Catering" category
- **Event Type Rules**:
  - Both packages and listings can have `eventTypes` array
  - Vendors can select multiple event types (e.g., ["Wedding", "Corporate"])
  - Validation ensures at least one event type is selected
  - Items without `eventTypes` are excluded when event type filter is active
- **Filtering Rules**:
  - Filtering uses **ITEM category** (`package.category` or `listing.category`), NOT vendor category
  - This allows items to be categorized independently of their vendor's primary category
- **User Flow**: Vendor creates listing → System validates category → If invalid, shows warning and suggestion → Vendor selects correct category and event types → Listing published

### 9. Payment Protection
- **Purpose**: Ensure secure and protected transactions
- **Features**:
  - Payment held securely until service completion
  - Full refund if vendor cancels
  - Dispute resolution support
  - 100% money-back guarantee
- **User Flow**: View protection info → Proceed with confidence → Pay securely

### 10. Package Information Display
- **Purpose**: Provide complete package details
- **Sections**:
  - Included items (✓ checkmarks)
  - Excluded items (✗ X marks)
  - Delivery time
  - Extra charges
  - Add-ons list
- **User Flow**: View package → Check inclusions/exclusions → Understand pricing → Customize → Book

---

## Technical Implementation Details

### State Management
- **Cart State**: React Context (`CartContext`) - global cart state
- **URL State**: React Router (`useSearchParams` for filters) - filters synced with URL
- **Component State**: React `useState` hooks - local component state
- **Memoization**: `useMemo` for expensive computations (filtering, sorting)
- **Synchronous Updates**: `flushSync` for immediate state updates before URL changes
- **Dynamic Keys**: React keys based on filters to prevent stale data carryover

### Data Flow
1. **Mock Data**: Data defined in `frontend/src/shared/constants/mockData.ts`
2. **Data Flattening**: `flattenPackages()` converts vendor/package/listing structure to unified `FlattenedPackage[]`
3. **Filtering**: Multi-level filtering (Event Type → Category → Listing) applied in `Search.tsx`
4. **Components**: Components consume flattened data through props/context
5. **User Actions**: User interactions update state/URL parameters
6. **Re-renders**: State changes trigger re-renders with fresh data (prevented stale data via dynamic keys)

### Database & Backend
- **Database**: Supabase PostgreSQL (hosted)
- **Storage**: Supabase Storage (for images/videos)
- **Backend**: Spring Boot (Java) with JPA/Hibernate
- **API**: RESTful APIs auto-generated by Supabase + custom Java backend APIs
- **Authentication**: Supabase Auth (planned)
- **RLS Policies**: Row Level Security for data access control

### Routing Structure
```
/ → Home page
/search → Search/Browse page
/vendor/:vendorId → Vendor details
/cart → Shopping cart
/checkout → Checkout page
/booking-success → Success page
/event-planner → Event planner
/login → Login page
/signup → Signup page
/test-upload → Test image upload (development)

Vendor Routes:
/vendor/onboarding → Vendor onboarding
/vendor/dashboard → Vendor dashboard
/vendor/profile → Vendor profile management
/vendor/calendar → Vendor calendar
/vendor/leads → Vendor leads
/vendor/listings → Vendor listings management
/vendor/orders → Vendor orders
/vendor/chat → Vendor chat
/vendor/wallet → Vendor wallet
/vendor/analytics → Vendor analytics
/vendor/reviews → Vendor reviews
/vendor/settings → Vendor settings
/vendor/help → Vendor help
```

### Project Structure
```
event-hub-connect/
├── frontend/                    # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── app/                # App entry point, routing
│   │   ├── features/           # Feature-based modules
│   │   │   ├── home/          # Home page components
│   │   │   ├── search/        # Search page components
│   │   │   ├── vendor/        # Vendor-related components
│   │   │   ├── cart/          # Cart components
│   │   │   ├── booking/        # Booking components
│   │   │   └── auth/          # Authentication components
│   │   ├── shared/            # Shared utilities and components
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── contexts/      # React contexts (Cart, etc.)
│   │   │   ├── constants/    # Mock data, constants
│   │   │   ├── utils/         # Utility functions
│   │   │   └── lib/           # Library configurations
│   │   └── main.tsx           # Entry point
│   ├── public/                 # Static assets (images, etc.)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                    # Spring Boot Java backend
│   ├── src/main/java/com/eventhub/
│   │   ├── model/             # JPA entity models
│   │   ├── repository/        # Spring Data JPA repositories
│   │   ├── service/           # Business logic services
│   │   ├── controller/        # REST controllers
│   │   └── config/           # Configuration classes
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── database/                    # Database scripts
│   ├── schema_v2.sql          # PostgreSQL schema
│   ├── seed_data_v2.sql       # Seed data
│   ├── storage_policies.sql   # Supabase Storage RLS policies
│   └── drop_tables.sql        # Drop tables script
│
├── docker-compose.yml          # Root-level Docker Compose (orchestrates frontend + backend)
├── .env                        # Environment variables (Supabase credentials, etc.)
└── README.md
```

### Key Components
- **Navbar**: Navigation bar (reusable across pages)
- **CinematicHero**: Hero section with dynamic backgrounds
- **VendorCard**: Vendor listing card (for vendor search view)
- **PackageCard**: Package/listing card (for search results, differentiates packages vs listings)
- **PremiumPackageCard**: Detailed package card (for vendor profile and "Packages Only" view)
- **PackageCustomization**: Customization dialog for packages
- **AvailabilityCalendar**: Calendar component for date/time selection
- **BookExactSetup**: Setup booking card
- **PremiumChatWindow**: Chat interface dialog
- **CartContext**: Cart state management (React Context)
- **ImageUpload**: Reusable image upload component with Supabase integration

---

## Business Metrics & KPIs

### Customer Metrics
- **Conversion Rate**: % of visitors who complete booking
- **Cart Abandonment Rate**: % who add to cart but don't checkout
- **Average Order Value**: Average transaction amount
- **Customer Lifetime Value**: Total value from repeat customers
- **Time to Booking**: Average time from landing to booking

### Vendor Metrics
- **Vendor Utilization Rate**: % of vendors with bookings
- **Average Booking Value**: Average per-vendor booking
- **Vendor Retention Rate**: % of vendors staying on platform
- **Response Time**: Average vendor response to inquiries

### Platform Metrics
- **Gross Merchandise Value (GMV)**: Total transaction value
- **Take Rate**: Platform fee % of GMV
- **Monthly Recurring Revenue**: Subscription revenue (if applicable)
- **Customer Acquisition Cost**: Cost to acquire new customer
- **Vendor Acquisition Cost**: Cost to onboard new vendor

---

## Technical Implementation Details

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API + React Query (for server state)
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Image Storage**: Supabase Storage (frontend uploads directly)

### Backend Architecture
- **Framework**: Spring Boot 3.x
- **ORM**: JPA/Hibernate
- **Database**: PostgreSQL (via Supabase)
- **API Style**: RESTful
- **Build Tool**: Maven
- **Containerization**: Docker

### Database Schema
- **Tables**: `vendors`, `packages`, `listings`, `add_ons`, `event_types`, `categories`, `event_type_categories`, `cart_items`, `orders`, `reviews`, `leads`, `chat_threads`, `messages`, `payments`, `wallets`, etc.
- **Relationships**: 
  - Vendor → Packages (One-to-Many)
  - Vendor → Listings (One-to-Many)
  - Package → AddOns (One-to-Many)
  - Listing → EventTypes (Many-to-Many via `listing_event_types`)
  - Package → EventTypes (Many-to-Many via `package_event_types`)
- **Key Constraints**: Foreign keys, CHECK constraints, unique constraints

### Deployment
- **Frontend**: Docker container (port 8080)
- **Backend**: Docker container (port 8081)
- **Orchestration**: Docker Compose (root-level `docker-compose.yml`)
- **Environment Variables**: `.env` file for Supabase credentials
- **Development**: Hot reload enabled for frontend, Maven wrapper for backend

## Future Enhancements

### Planned Features
1. **Vendor Dashboard**: ✅ Partially implemented - vendor pages exist, need backend integration
2. **Customer Dashboard**: For customers to track bookings
3. **Review System**: ✅ UI exists, need backend integration
4. **Payment Gateway Integration**: Real payment processing (Razorpay/Stripe)
5. **Email Notifications**: Booking confirmations and updates
6. **Mobile App**: Native iOS/Android apps
7. **Advanced Search**: AI-powered search with natural language
8. **Wishlist**: Save favorite vendors/packages
9. **Referral Program**: Customer referral incentives
10. **Loyalty Program**: Rewards for repeat customers
11. **Real-time Chat**: WebSocket integration for live chat
12. **Image Optimization**: Automatic image compression and CDN
13. **Analytics Dashboard**: Vendor and platform analytics
14. **Multi-language Support**: i18n for multiple languages

---

## Conclusion

Event Hub Connect operates as a comprehensive marketplace platform connecting event organizers with service providers. The platform generates revenue through transaction commissions while providing value to both customers (convenience, transparency, security) and vendors (visibility, leads, payment security).

The user journey is designed to be intuitive and efficient, allowing customers to discover, customize, and book multiple vendors in a single transaction. The platform's key differentiators include multi-vendor booking, transparent pricing, real-time availability, and AI-powered recommendations.

### Current Implementation Status

**Frontend (✅ Complete)**:
- All user-facing pages implemented
- Search and filtering with strict hierarchical logic (Event Type → Category → Listing)
- Vendor profile with consolidated listings tab (packages + individual listings)
- Cart and checkout flow
- Package customization
- Image upload to Supabase Storage
- Responsive design with modern UI
- Docker containerization

**Backend (🚧 In Progress)**:
- Spring Boot project structure created
- JPA entity models defined
- Repository and service layers implemented
- REST controllers created
- Docker configuration complete
- Database schema designed and documented
- Connection to Supabase PostgreSQL configured

**Database (✅ Complete)**:
- PostgreSQL schema designed (`schema_v2.sql`)
- Seed data prepared (`seed_data_v2.sql`)
- Supabase Storage buckets configured
- RLS policies defined
- Separate `packages` and `listings` tables with proper relationships

**Next Steps**:
1. Connect frontend to backend APIs (replace mock data)
2. Implement authentication (Supabase Auth)
3. Add payment gateway integration (Razorpay/Stripe)
4. Complete vendor dashboard backend integration
5. Deploy to production environment

This documentation covers every button, interaction, and flow in the platform, providing a complete understanding of the business model and user experience. The document is regularly updated to reflect the current implementation state and architectural decisions.


