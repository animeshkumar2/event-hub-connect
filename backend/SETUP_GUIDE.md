# Backend Setup Guide

## ✅ What's Been Created

All backend files have been created:
- ✅ Project structure
- ✅ Entity models (Vendor, Listing, Category, EventType, City)
- ✅ Repositories (JPA)
- ✅ Services (Business logic)
- ✅ Controllers (REST APIs)
- ✅ DTOs (Data Transfer Objects)
- ✅ CORS configuration
- ✅ Maven configuration (pom.xml)

## 🚀 Next Steps

### Step 1: Get Database Password

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `vwhxzxayzpdfmpnnzslq`
3. Go to **Settings** → **Database**
4. Find **Database password** section
5. Copy the password (or reset if needed)

### Step 2: Update Configuration

Edit `src/main/resources/application.properties`:

```properties
# Replace YOUR_DATABASE_PASSWORD with the password from Step 1
spring.datasource.password=YOUR_DATABASE_PASSWORD
```

### Step 3: Install Maven Wrapper (if needed)

If you don't have Maven installed, download the wrapper:

```bash
cd backend
curl -s https://raw.githubusercontent.com/takari/maven-wrapper/master/maven-wrapper.jar -o .mvn/wrapper/maven-wrapper.jar
chmod +x mvnw
```

Or install Maven globally:
```bash
# macOS
brew install maven

# Or download from: https://maven.apache.org/download.cgi
```

### Step 4: Run the Application

```bash
cd backend

# Using Maven Wrapper (recommended)
./mvnw spring-boot:run

# Or using Maven (if installed)
mvn spring-boot:run
```

The API will start at: **http://localhost:8081**

### Step 5: Test the API

Open a new terminal and test:

```bash
# Get all vendors
curl http://localhost:8081/api/vendors

# Get listings
curl http://localhost:8081/api/listings

# Get listings by category
curl http://localhost:8081/api/listings?category=photographer

# Get packages only
curl http://localhost:8081/api/listings?type=package
```

## 📋 API Endpoints

### Vendors

- `GET /api/vendors` - Get all vendors
  - Query params: `category`, `city`, `minRating`
- `GET /api/vendors/{id}` - Get vendor by ID

### Listings

- `GET /api/listings` - Get all listings
  - Query params: `eventType`, `category`, `type` (package/item)
- `GET /api/listings/{id}` - Get listing by ID
- `GET /api/listings/vendor/{vendorId}` - Get vendor's listings

## 🔧 Troubleshooting

### Issue: "Connection refused" or "Connection timeout"

**Solution:**
1. Check your Supabase database password is correct
2. Verify database URL in `application.properties`
3. Check if Supabase database is running (should be always on)

### Issue: "Table does not exist"

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `database/schema_v2.sql` to create tables
3. Run `database/seed_data_v2.sql` to add reference data

### Issue: "CORS error" when calling from frontend

**Solution:**
- CORS is already configured in `CorsConfig.java`
- Make sure frontend is running on `http://localhost:8080`
- Backend is running on `http://localhost:8081`

### Issue: "No data returned"

**Solution:**
1. Check if tables have data:
   ```sql
   SELECT COUNT(*) FROM vendors;
   SELECT COUNT(*) FROM listings;
   ```
2. If empty, seed data using `database/seed_data_v2.sql`

### Issue: Maven not found

**Solution:**
- Use Maven Wrapper: `./mvnw` instead of `mvn`
- Or install Maven: `brew install maven` (macOS)

## 📁 Project Structure

```
backend/
├── src/main/java/com/eventhub/
│   ├── EventHubApplication.java          # Main application class
│   ├── config/
│   │   └── CorsConfig.java               # CORS configuration
│   ├── model/                            # JPA Entities
│   │   ├── EventType.java
│   │   ├── Category.java
│   │   ├── City.java
│   │   ├── Vendor.java
│   │   └── Listing.java
│   ├── repository/                       # Data Access Layer
│   │   ├── VendorRepository.java
│   │   └── ListingRepository.java
│   ├── service/                          # Business Logic
│   │   ├── VendorService.java
│   │   └── ListingService.java
│   ├── controller/                       # REST Controllers
│   │   ├── VendorController.java
│   │   └── ListingController.java
│   └── dto/                             # Data Transfer Objects
│       ├── VendorDTO.java
│       └── ListingDTO.java
├── src/main/resources/
│   └── application.properties           # Configuration
├── pom.xml                              # Maven dependencies
└── README.md
```

## ✅ Checklist

Before running:
- [ ] Database password updated in `application.properties`
- [ ] Database schema created (`schema_v2.sql` run in Supabase)
- [ ] Reference data seeded (`seed_data_v2.sql` run in Supabase)
- [ ] Maven or Maven Wrapper available

After running:
- [ ] Application starts without errors
- [ ] `GET /api/vendors` returns data
- [ ] `GET /api/listings` returns data
- [ ] Filters work correctly

## 🎯 Next Development Steps

1. **Add Error Handling**
   - Create `GlobalExceptionHandler.java`
   - Add proper error responses

2. **Add Validation**
   - Add `@Valid` annotations
   - Create validation DTOs

3. **Add Authentication**
   - Integrate Supabase Auth
   - Add JWT token validation

4. **Add POST/PUT/DELETE**
   - Create vendor
   - Update vendor
   - Delete vendor (soft delete)

5. **Add More Entities**
   - Order
   - Cart
   - Review
   - Payment

6. **Add Swagger Documentation**
   - Add SpringDoc OpenAPI
   - Document all endpoints

## 📚 Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **JPA Docs**: https://docs.spring.io/spring-data/jpa/docs/current/reference/html/
- **Supabase Docs**: https://supabase.com/docs




