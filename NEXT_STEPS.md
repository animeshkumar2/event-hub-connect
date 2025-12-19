# Next Steps - Event Hub Connect Backend

## ✅ Completed

1. ✅ Database schema created (`schema_v2.sql`)
2. ✅ Reference data seeded (`seed_data_v2.sql`)
3. ✅ Database connection ready

## 🎯 Immediate Next Steps

### 1. Set Up Supabase Storage (Images/Videos)

**Action Items:**
- [ ] Create storage buckets in Supabase Dashboard
- [ ] Set up RLS policies for buckets
- [ ] Test file upload via Supabase dashboard

**Files to create:**
- `backend/src/main/java/com/eventhub/storage/StorageService.java`
- `backend/src/main/java/com/eventhub/storage/StorageController.java`

**See:** `database/STORAGE_SETUP.md` for detailed instructions

---

### 2. Create Spring Boot Project Structure

**Recommended Structure:**
```
backend/
├── src/
│   └── main/
│       ├── java/com/eventhub/
│       │   ├── EventHubApplication.java
│       │   ├── config/
│       │   │   ├── DatabaseConfig.java
│       │   │   └── SupabaseConfig.java
│       │   ├── controller/
│       │   │   ├── VendorController.java
│       │   │   ├── ListingController.java
│       │   │   ├── OrderController.java
│       │   │   └── AuthController.java
│       │   ├── service/
│       │   │   ├── VendorService.java
│       │   │   ├── ListingService.java
│       │   │   └── OrderService.java
│       │   ├── repository/
│       │   │   ├── VendorRepository.java
│       │   │   ├── ListingRepository.java
│       │   │   └── OrderRepository.java
│       │   ├── model/
│       │   │   ├── Vendor.java
│       │   │   ├── Listing.java
│       │   │   └── Order.java
│       │   └── dto/
│       │       ├── VendorDTO.java
│       │       └── ListingDTO.java
│       └── resources/
│           ├── application.properties
│           └── application-dev.properties
├── pom.xml (or build.gradle)
└── README.md
```

---

### 3. Configure Database Connection

**File:** `src/main/resources/application.properties`

```properties
# Supabase PostgreSQL Connection
spring.datasource.url=jdbc:postgresql://db.xxx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server
server.port=8080
```

---

### 4. Create Entity Models (JPA)

**Priority Order:**

1. **Reference Data Entities** (Simple, no dependencies)
   - `EventType.java`
   - `Category.java`
   - `City.java`

2. **Core Entities**
   - `Vendor.java`
   - `Listing.java` (with `@DiscriminatorColumn` for type)
   - `PackageItem.java` (Junction entity)

3. **Transaction Entities**
   - `Order.java`
   - `CartItem.java`
   - `Payment.java`

---

### 5. Create REST API Endpoints

**Start with MVP endpoints:**

**Vendors:**
- `GET /api/vendors` - List vendors (with filters)
- `GET /api/vendors/{id}` - Get vendor details
- `POST /api/vendors` - Create vendor (admin/vendor)
- `PUT /api/vendors/{id}` - Update vendor

**Listings:**
- `GET /api/listings` - List listings (with filters: eventType, category, type)
- `GET /api/listings/{id}` - Get listing details
- `POST /api/listings` - Create listing (vendor)
- `PUT /api/listings/{id}` - Update listing

**Orders:**
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/user/{userId}` - Get user's orders

---

### 6. Implement Filtering Logic

**Critical:** Event Type → Category → Listing filtering

**Service Layer:**
```java
@Service
public class ListingService {
    
    public List<Listing> getListings(
        String eventType, 
        String category, 
        String listingType // 'package' or 'item'
    ) {
        // 1. Filter by eventType (if provided)
        // 2. Filter by category (if provided)
        // 3. Filter by listingType (if provided)
        // 4. Apply other filters (city, price, etc.)
    }
}
```

---

### 7. Set Up Authentication

**Options:**
- Use Supabase Auth (recommended)
- Or implement JWT authentication

**Supabase Auth Integration:**
```java
// Verify Supabase JWT token
public boolean verifyToken(String token) {
    // Use Supabase Admin API to verify
}
```

---

## 📋 Development Checklist

### Phase 1: Setup (Week 1)
- [ ] Create Spring Boot project
- [ ] Configure database connection
- [ ] Set up Supabase Storage
- [ ] Create entity models
- [ ] Set up repositories (JPA)

### Phase 2: Core APIs (Week 2)
- [ ] Vendor CRUD APIs
- [ ] Listing CRUD APIs
- [ ] Filtering logic (Event Type → Category)
- [ ] Package-Item relationships

### Phase 3: Transactions (Week 3)
- [ ] Cart APIs
- [ ] Order APIs
- [ ] Payment integration (Razorpay)

### Phase 4: Advanced (Week 4)
- [ ] Authentication/Authorization
- [ ] File upload APIs
- [ ] Search functionality
- [ ] Analytics endpoints

---

## 🔧 Tools & Dependencies

### Required Dependencies (Maven)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Lombok (optional but recommended) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 🚀 Quick Start Commands

```bash
# Create Spring Boot project (using Spring Initializr)
# Or use: https://start.spring.io/

# Run application
./mvnw spring-boot:run

# Or with Gradle
./gradlew bootRun
```

---

## 📚 Resources

- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **JPA Docs**: https://docs.spring.io/spring-data/jpa/docs/current/reference/html/

---

## 💡 Tips

1. **Start Small**: Build MVP endpoints first, then expand
2. **Test Early**: Write unit tests as you build
3. **Use DTOs**: Don't expose entities directly in APIs
4. **Handle Errors**: Implement proper error handling
5. **Log Everything**: Use logging for debugging
6. **Document APIs**: Use Swagger/OpenAPI

---

## Questions?

- Database schema issues? Check `database/schema_v2.sql`
- Storage setup? Check `database/STORAGE_SETUP.md`
- API design? Follow REST best practices









