# Quick Start Guide

Get the application running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Java 21+ installed (or use Maven wrapper)
- Supabase database access
- Docker (optional, for containerized setup)

## Step 1: Load Seed Data (One-time setup)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `database/seed_data_complete.sql`
3. Click "Run"
4. Verify: Should see "Seed data inserted successfully!"

## Step 2: Configure Environment

### Frontend

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_SUPABASE_URL=https://vwhxzxayzpdfmpnnzslq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHh6eGF5enBkZm1wbm56c2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDM4NjksImV4cCI6MjA4MDI3OTg2OX0.eOg_EmPuJA9SJdhkbw1zBH5jthFrZ5Jo9o_zRztfgCY
```

## Step 3: Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Wait for: `Started EventHubApplication in X.XXX seconds`

Backend will be available at: `http://localhost:8081`

## Step 4: Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:8080`

## Step 5: Test

1. Open browser: `http://localhost:8080`
2. Navigate to Search page
3. Select "Wedding" event type
4. Select "Photography" category
5. You should see listings from the seed data!

## Verify Backend is Working

```bash
# Test stats endpoint
curl http://localhost:8081/api/public/stats

# Test search endpoint
curl "http://localhost:8081/api/public/search/listings?eventType=1&category=photographer"
```

## Troubleshooting

### Backend won't start
- Check Java version: `java -version` (should be 21+)
- Check database connection in `application.properties`
- Check port 8081 is not in use

### Frontend shows errors
- Check `.env` file exists in `frontend/` directory
- Check backend is running
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is correct

### No data showing
- Verify seed data was loaded (check Supabase Dashboard)
- Check backend logs for errors
- Test API endpoints directly with curl

### CORS errors
- Backend CORS is configured for `http://localhost:8080`
- If using different port, update `SecurityConfig.java`

## Using Docker (Alternative)

```bash
# Start both frontend and backend
docker-compose up

# Or start individually
cd backend && docker-compose up
cd frontend && docker-compose up
```

## Next Steps

- Read `INTEGRATION_GUIDE.md` for detailed integration info
- Read `database/SEED_DATA_README.md` for seed data details
- Check `backend/IMPLEMENTATION_COMPLETE.md` for backend features





