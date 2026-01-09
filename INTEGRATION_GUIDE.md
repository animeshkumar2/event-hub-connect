# Frontend-Backend Integration Guide

This guide explains how to integrate the frontend with the backend API and load seed data for testing.

## Prerequisites

1. ✅ Backend is implemented (140 Java files)
2. ✅ Database schema is created (`database/schema_v2.sql`)
3. ✅ Frontend is restructured (`frontend/` directory)

## Step 1: Load Seed Data

### Using Supabase Dashboard (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/seed_data_complete.sql`
3. Paste and execute

### Using psql

```bash
psql -h db.vwhxzxayzpdfmpnnzslq.supabase.co -U postgres -d postgres -f database/seed_data_complete.sql
```

### Verify Data

```sql
-- Check vendors
SELECT COUNT(*) FROM vendors; -- Should be 6

-- Check listings
SELECT COUNT(*) FROM listings; -- Should be 11

-- Check reviews
SELECT COUNT(*) FROM reviews; -- Should be 7
```

## Step 2: Configure Environment Variables

### Backend

The backend is already configured in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=event@9060dbpassword
```

### Frontend

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_SUPABASE_URL=https://vwhxzxayzpdfmpnnzslq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Or using Docker:
```bash
cd backend
docker-compose up
```

Backend will run on `http://localhost:8081`

## Step 4: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:8080`

## Step 5: Test Integration

### 1. Test Public API

```bash
# Get stats
curl http://localhost:8081/api/public/stats

# Get event types
curl http://localhost:8081/api/public/event-types

# Get categories
curl http://localhost:8081/api/public/categories

# Search listings
curl "http://localhost:8081/api/public/search/listings?eventType=1&category=photographer"
```

### 2. Test Frontend

1. Open `http://localhost:8080`
2. Navigate to Search page
3. Select event type (e.g., Wedding)
4. Select category (e.g., Photography)
5. Verify listings are displayed

### 3. Test Vendor Profile

1. Navigate to `/vendor/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
2. Should show Moments Photography Studio
3. Verify packages and listings are displayed
4. Check reviews and FAQs

## API Integration Points

### Frontend API Service

Located at `frontend/src/shared/services/api.ts`:

- **publicApi**: Public endpoints (no auth)
- **authApi**: Authentication endpoints
- **customerApi**: Customer endpoints (requires auth)
- **vendorApi**: Vendor endpoints (requires vendor role)

### React Hooks

Located at `frontend/src/shared/hooks/useApi.ts`:

- `useEventTypes()` - Get event types
- `useCategories()` - Get categories
- `useSearchListings(params)` - Search listings
- `useVendor(vendorId)` - Get vendor details
- `useVendorListings(vendorId)` - Get vendor listings
- `useVendorPackages(vendorId)` - Get vendor packages
- `useVendorReviews(vendorId)` - Get vendor reviews

### Updated Components

1. **Search.tsx**: Now uses `useSearchListings` hook
2. **VendorDetails.tsx**: Should use `useVendor`, `useVendorPackages`, etc.
3. **Home.tsx**: Can use `useStats` for platform statistics

## Authentication Flow

### 1. Register/Login

```typescript
import { authApi } from '@/shared/services/api';
import { apiClient } from '@/shared/services/api';

// Register
const response = await authApi.register({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe',
  isVendor: false
});

// Store token
apiClient.setToken(response.data.token);
localStorage.setItem('user_id', response.data.userId);
```

### 2. Making Authenticated Requests

The API client automatically includes:
- `Authorization: Bearer <token>` header
- `X-User-Id` header (for customer endpoints)
- `X-Vendor-Id` header (for vendor endpoints)

## Common Issues & Solutions

### Issue: CORS Error

**Solution**: Backend CORS is configured in `SecurityConfig.java`. Ensure frontend URL is allowed.

### Issue: 401 Unauthorized

**Solution**: 
- Check if token is set: `apiClient.setToken(token)`
- Verify token is valid
- Check user role matches endpoint requirements

### Issue: No Data Showing

**Solution**:
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:8081/api/public/stats`
3. Check network tab for API calls
4. Verify seed data is loaded

### Issue: Database Connection Error

**Solution**:
1. Verify Supabase credentials in `application.properties`
2. Check database is accessible
3. Verify network connectivity

## Next Steps

1. **Update More Components**:
   - VendorDetails.tsx
   - Cart.tsx
   - Checkout.tsx
   - Vendor dashboard pages

2. **Add Error Handling**:
   - Global error boundary
   - Toast notifications for errors
   - Retry logic for failed requests

3. **Add Loading States**:
   - Skeleton loaders
   - Progress indicators
   - Optimistic updates

4. **Add Caching**:
   - Cache API responses
   - Use React Query for better caching
   - Implement stale-while-revalidate

## Testing Checklist

- [ ] Seed data loaded successfully
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Public endpoints work (stats, search, vendor profiles)
- [ ] Search filters work correctly
- [ ] Vendor profiles display correctly
- [ ] Cart functionality works
- [ ] Authentication flow works
- [ ] Protected endpoints require auth
- [ ] Error handling works

## Support

For issues:
1. Check logs: Backend (`backend/logs/`) and Frontend (browser console)
2. Verify database connection
3. Check API responses in network tab
4. Review error messages











