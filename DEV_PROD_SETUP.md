# Development & Production Environment Setup

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   DEV (Local)       │     │   PROD (Existing)   │
│   PostgreSQL 15     │     │   Supabase          │
│   Docker Container  │     │   (unchanged)       │
│                     │     │                     │
│   Port: 5433        │     │   Existing config   │
│   Schema + Data     │     │   works as-is       │
└─────────────────────┘     └─────────────────────┘
```

## New Files Created (Dev Only)

| File | Purpose |
|------|---------|
| `docker-compose-dev.yml` | Local dev with PostgreSQL |
| `backend/.../application-dev.properties` | Local DB settings |
| `frontend/.env.dev` | Local API URL |

## Quick Start - Local Development

### 1. Start local dev environment
```bash
docker compose -f docker-compose-dev.yml up -d
```

This starts:
- PostgreSQL dev database (port 5433)
- Backend with `dev` profile (port 8082)
- Frontend (port 8080)

### 2. Or run backend locally (without full Docker)
```bash
# Start only the database
docker compose -f docker-compose-dev.yml up -d postgres-dev

# Run backend with dev profile
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### 3. Run frontend locally
```bash
cd frontend
npm run dev
```

## Database Migration

### Export from old Supabase (schema + data for dev)
```bash
pg_dump "postgresql://postgres:[OLD_PASSWORD]@db.[OLD_REF].supabase.co:5432/postgres" \
  --clean --if-exists --no-owner --no-privileges \
  > full_backup.sql
```

### Import to local dev database
```bash
# Make sure postgres-dev is running
docker compose -f docker-compose-dev.yml up -d postgres-dev

# Import
psql "postgresql://postgres:devpassword123@localhost:5433/eventhub" < full_backup.sql
```

### Export schema only for new production
```bash
pg_dump "postgresql://postgres:[OLD_PASSWORD]@db.[OLD_REF].supabase.co:5432/postgres" \
  --schema-only --clean --if-exists --no-owner --no-privileges \
  > schema_only.sql
```

### Import to new production Supabase
```bash
psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres" < schema_only.sql
```

## Running in Different Modes

### Local Development
```bash
# With Docker
docker compose -f docker-compose-dev.yml up -d

# Or manually with dev profile
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### Production (unchanged)
Existing `docker-compose.yml` and configs continue to work as before.

## Database Connections

### Dev (Local Docker)
```
Host: localhost
Port: 5433
Database: eventhub
Username: postgres
Password: devpassword123
```

### Prod (Existing Supabase - unchanged)
Uses existing `application.properties` settings.

## Useful Commands

```bash
# Start dev environment
docker compose -f docker-compose-dev.yml up -d

# View dev database logs
docker compose -f docker-compose-dev.yml logs -f postgres-dev

# Reset dev database (delete all data)
docker compose -f docker-compose-dev.yml down -v
docker compose -f docker-compose-dev.yml up -d postgres-dev

# Connect to dev database
psql "postgresql://postgres:devpassword123@localhost:5433/eventhub"

# Stop dev environment
docker compose -f docker-compose-dev.yml down
```
