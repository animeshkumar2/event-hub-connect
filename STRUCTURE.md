# Project Structure Guide

## ✅ Completed Restructuring

The project has been reorganized into a clean, maintainable structure with clear separation between frontend and backend.

## 📁 Final Structure

```
event-hub-connect/
├── frontend/              # React + TypeScript Frontend
│   ├── src/
│   │   ├── app/          # App entry, routing
│   │   ├── features/     # Feature modules
│   │   └── shared/       # Shared code
│   ├── public/
│   └── package.json
│
├── backend/               # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/eventhub/
│   │       ├── model/
│   │       ├── repository/
│   │       ├── service/
│   │       ├── controller/
│   │       └── dto/
│   └── pom.xml
│
├── database/              # Database scripts
│   ├── schema_v2.sql
│   └── seed_data_v2.sql
│
└── docker-compose.yml     # Orchestrates both services
```

## 🎯 Frontend Structure Details

### Features (Feature-Based Architecture)
- **home/** - Landing page, hero sections, navigation
- **search/** - Search, filtering, category browsing
- **vendor/** - Vendor profiles, listings, dashboard
- **auth/** - Authentication
- **cart/** - Shopping cart, checkout
- **booking/** - Event planning, booking success

### Shared
- **components/** - Reusable UI components (including Shadcn UI)
- **hooks/** - Custom React hooks
- **utils/** - Utility functions
- **lib/** - Library configurations (Supabase, utils)
- **contexts/** - React contexts (Cart, etc.)
- **constants/** - Constants, mock data

## 🔧 Import Paths

All imports use path aliases:

```typescript
// Feature imports
import { Navbar } from '@/features/home/Navbar';
import { Search } from '@/features/search/Search';

// Shared imports
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';
import { mockVendors } from '@/shared/constants/mockData';

// App imports
import App from '@/app/App';
```

## 🚀 Running the Project

### Development (Separate)
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && ./mvnw spring-boot:run
```

### Docker (Both Services)
```bash
docker compose up
```

## 📝 Next Steps

1. **Test the application** - Ensure all imports work correctly
2. **Update any remaining imports** - Check for any broken imports
3. **Reinstall node_modules** - Run `npm install` in frontend/
4. **Update .gitignore** - Ensure proper ignores for both frontend and backend

## ✨ Benefits of New Structure

1. **Clear Separation** - Frontend and backend are clearly separated
2. **Feature-Based** - Frontend organized by features, easier to maintain
3. **Scalable** - Easy to add new features
4. **Shared Code** - Common utilities in one place
5. **Better Imports** - Path aliases make imports cleaner
6. **Docker Ready** - Root docker-compose orchestrates both services

## 🔍 Verification Checklist

- [x] Frontend files moved to `frontend/`
- [x] Backend files in `backend/`
- [x] Features organized by domain
- [x] Shared code in `shared/`
- [x] Import paths updated
- [x] Config files updated (vite, tsconfig)
- [x] Docker compose updated
- [x] README files created

## 📚 Documentation

- **Root README**: Overview of entire project
- **Frontend README**: Frontend-specific documentation
- **Backend README**: Backend setup and API docs




