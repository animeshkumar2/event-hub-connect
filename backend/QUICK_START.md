# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Update Database Password

Edit `src/main/resources/application.properties`:

```properties
# Get password from: Supabase Dashboard → Settings → Database
spring.datasource.password=YOUR_DATABASE_PASSWORD_HERE
```

### Step 2: Run Application

```bash
cd backend

# If you have Maven installed:
mvn spring-boot:run

# Or download Maven Wrapper first:
curl -s https://raw.githubusercontent.com/takari/maven-wrapper/master/maven-wrapper.jar -o .mvn/wrapper/maven-wrapper.jar
chmod +x mvnw
./mvnw spring-boot:run
```

### Step 3: Test API

```bash
# In another terminal:
curl http://localhost:8081/api/vendors
curl http://localhost:8081/api/listings
```

## ✅ Success Indicators

- Application starts on port 8081
- No database connection errors
- API returns data (or empty array if no data)

## 📝 Next Steps

See `SETUP_GUIDE.md` for detailed instructions.

