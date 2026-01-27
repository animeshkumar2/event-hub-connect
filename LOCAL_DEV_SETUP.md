# Local Development Setup Guide

## Prerequisites

- Docker Desktop installed and running
- Java 21 installed
- Node.js 20+ installed

## Step 1: Start Local Development Environment

```bash
docker compose -f docker-compose-dev.yml up -d
```

This starts:
- PostgreSQL database on port 5433
- Backend API on port 8082
- Frontend on port 8080

**Verify containers are running:**
```bash
docker ps
```

You should see:
- `eventhub-dev-db`
- `eventhub-backend-dev`
- `eventhub-frontend-dev`

## Step 2: Import Data to Local Database

### Option A: If you have PostgreSQL client installed

```bash
# Export from production Supabase
PGPASSWORD='event@9060dbpassword' pg_dump \
  -h aws-1-ap-south-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.aoyvpquvjxofdkukmqty \
  -d postgres \
  --clean --if-exists --no-owner --no-privileges \
  > full_backup.sql

# Import to local dev
PGPASSWORD='devpassword123' psql \
  -h localhost \
  -p 5433 \
  -U postgres \
  -d eventhub \
  < full_backup.sql
```

### Option B: If you need to install PostgreSQL client first

**On macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"

# Install PostgreSQL client
brew install libpq
brew link --force libpq

# Now run the export/import commands from Option A
```

**On Windows:**
Download and install PostgreSQL from https://www.postgresql.org/download/windows/

**On Linux:**
```bash
sudo apt-get install postgresql-client
```

## Step 3: Access Your Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8082/api
- **Database:** localhost:5433

## Step 4: Database Management (Optional)

Install **TablePlus** for easy database management:
- Download: https://tableplus.com/

**Connection settings:**
```
Host: localhost
Port: 5433
User: postgres
Password: devpassword123
Database: eventhub
```

## Common Commands

### Start dev environment
```bash
docker compose -f docker-compose-dev.yml up -d
```

### Stop dev environment
```bash
docker compose -f docker-compose-dev.yml down
```

### View logs
```bash
# All services
docker compose -f docker-compose-dev.yml logs -f

# Specific service
docker logs -f eventhub-backend-dev
docker logs -f eventhub-frontend-dev
docker logs -f eventhub-dev-db
```

### Restart a service
```bash
docker compose -f docker-compose-dev.yml restart backend-dev
docker compose -f docker-compose-dev.yml restart frontend-dev
```

### Reset database (delete all data)
```bash
docker compose -f docker-compose-dev.yml down -v
docker compose -f docker-compose-dev.yml up -d
# Then re-import data
```

### Connect to database via CLI
```bash
PGPASSWORD='devpassword123' psql -h localhost -p 5433 -U postgres -d eventhub
```

## Running Services Individually (Without Docker)

### Run only database in Docker
```bash
docker compose -f docker-compose-dev.yml up -d postgres-dev
```

### Run backend locally
```bash
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### Run frontend locally
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 8082
kill -9 $(lsof -ti:8082)

# Find and kill process on port 8080
kill -9 $(lsof -ti:8080)

# Find and kill process on port 5433
kill -9 $(lsof -ti:5433)
```

### Backend not connecting to database
Check if postgres-dev is healthy:
```bash
docker ps
docker logs eventhub-dev-db
```

### Frontend can't reach backend
Verify backend is running:
```bash
curl http://localhost:8082/api/health
```

### Database connection refused
Make sure postgres-dev container is running:
```bash
docker compose -f docker-compose-dev.yml up -d postgres-dev
```

## Environment Files

| File | Purpose |
|------|---------|
| `backend/src/main/resources/application-dev.properties` | Local PostgreSQL config |
| `frontend/.env.dev` | Local API URL |
| `frontend/.env.local` | Personal overrides (gitignored) |

## Production vs Development

**Development (Local):**
- Uses `docker-compose-dev.yml`
- PostgreSQL in Docker (port 5433)
- Backend uses `dev` profile
- All data local, no cloud costs

**Production (Existing):**
- Uses `docker-compose.yml`
- Supabase PostgreSQL
- Backend uses default config
- Unchanged from current setup

## Next Steps

1. Make changes to code
2. Test locally with real data
3. Commit changes
4. Deploy to production (existing process unchanged)
