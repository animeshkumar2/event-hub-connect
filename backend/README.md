# EventHub Backend API

Spring Boot backend for Event Hub Connect platform.

## Prerequisites

- Java 21 (or 17)
- Maven 3.8+
- Supabase PostgreSQL database

## Setup

### 1. Configure Database

Edit `src/main/resources/application.properties`:

```properties
# Replace YOUR_DATABASE_PASSWORD with your Supabase database password
spring.datasource.password=YOUR_DATABASE_PASSWORD
```

**To get your database password:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the database password
3. Update `application.properties`

### 2. Run Application

```bash
# Using Maven Wrapper
./mvnw spring-boot:run

# Or using Maven (if installed)
mvn spring-boot:run
```

The API will be available at: `http://localhost:8081`

## API Endpoints

### Vendors

- `GET /api/vendors` - Get all vendors
  - Query params: `category`, `city`, `minRating`
- `GET /api/vendors/{id}` - Get vendor by ID

### Listings

- `GET /api/listings` - Get all listings
  - Query params: `eventType`, `category`, `type` (package/item)
- `GET /api/listings/{id}` - Get listing by ID
- `GET /api/listings/vendor/{vendorId}` - Get vendor's listings

## Testing

```bash
# Get all vendors
curl http://localhost:8081/api/vendors

# Get listings by category
curl http://localhost:8081/api/listings?category=photographer

# Get packages only
curl http://localhost:8081/api/listings?type=package
```

## Project Structure

```
backend/
├── src/main/java/com/eventhub/
│   ├── EventHubApplication.java
│   ├── config/
│   │   └── CorsConfig.java
│   ├── model/
│   │   ├── EventType.java
│   │   ├── Category.java
│   │   ├── City.java
│   │   ├── Vendor.java
│   │   └── Listing.java
│   ├── repository/
│   │   ├── VendorRepository.java
│   │   └── ListingRepository.java
│   ├── service/
│   │   ├── VendorService.java
│   │   └── ListingService.java
│   ├── controller/
│   │   ├── VendorController.java
│   │   └── ListingController.java
│   └── dto/
│       ├── VendorDTO.java
│       └── ListingDTO.java
└── pom.xml
```

## Next Steps

1. Add authentication
2. Add POST/PUT/DELETE endpoints
3. Add error handling
4. Add validation
5. Add Swagger documentation











