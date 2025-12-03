# Event Hub Connect

A comprehensive event planning platform connecting customers with vendors for weddings, corporate events, and more.

## 📁 Project Structure

```
event-hub-connect/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── app/       # App entry point, routing
│   │   ├── features/  # Feature-based modules
│   │   │   ├── home/
│   │   │   ├── search/
│   │   │   ├── vendor/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   └── booking/
│   │   └── shared/    # Shared components, utils, hooks
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── utils/
│   │       ├── lib/
│   │       ├── contexts/
│   │       └── constants/
│   ├── public/
│   └── package.json
│
├── backend/           # Spring Boot + Java
│   ├── src/
│   │   └── main/
│   │       ├── java/com/eventhub/
│   │       │   ├── model/      # JPA Entities
│   │       │   ├── repository/ # Data Access
│   │       │   ├── service/    # Business Logic
│   │       │   ├── controller/ # REST APIs
│   │       │   └── dto/        # Data Transfer Objects
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── database/          # SQL scripts
    ├── schema_v2.sql
    ├── seed_data_v2.sql
    └── storage_policies.sql
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 21
- Maven 3.8+
- Docker (optional)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:8080`

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on: `http://localhost:8081`

### Docker Setup (Both Services)

```bash
docker compose up
```

This starts both frontend and backend services.

## 📚 Documentation

- **Frontend**: See `frontend/README.md`
- **Backend**: See `backend/README.md`
- **Database**: See `database/README.md`

## 🛠️ Development

### Frontend Structure

- **Features**: Organized by domain (home, search, vendor, etc.)
- **Shared**: Reusable components, utilities, hooks
- **App**: Main application setup, routing

### Backend Structure

- **Model**: JPA entities
- **Repository**: Data access layer
- **Service**: Business logic
- **Controller**: REST API endpoints
- **DTO**: Data transfer objects

## 🔗 API Endpoints

- `GET /api/vendors` - List vendors
- `GET /api/vendors/{id}` - Get vendor details
- `GET /api/listings` - List packages/listings
- `GET /api/listings/{id}` - Get listing details

## 📝 Environment Variables

Create `.env` file in root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run test

# Backend
cd backend
./mvnw test
```

## 📦 Deployment

See individual README files in `frontend/` and `backend/` directories for deployment instructions.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## 📄 License

MIT
