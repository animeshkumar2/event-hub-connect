# Docker Networking Issue - Troubleshooting

## Problem
The Docker container cannot reach the Supabase database, showing "Network unreachable" error.

## Quick Fixes

### Option 1: Restart Docker Desktop
1. Quit Docker Desktop completely
2. Restart Docker Desktop
3. Run `docker compose up` again

### Option 2: Check Docker Desktop Network Settings
1. Open Docker Desktop
2. Go to Settings → Resources → Network
3. Ensure "Enable host networking" is checked (if available)
4. Restart Docker Desktop

### Option 3: Run Backend Locally (Without Docker)
Since the host machine can reach the database, run the backend directly:

```bash
cd backend
./mvnw spring-boot:run
```

Or if you have Maven installed:
```bash
mvn spring-boot:run
```

### Option 4: Use Docker with Host Network (Linux only)
On Linux, you can use `network_mode: host` in docker-compose.yml, but this doesn't work on macOS.

## Verify Network Connectivity

### From Host Machine:
```bash
nc -zv db.vwhxzxayzpdfmpnnzslq.supabase.co 5432
```

### From Docker Container:
```bash
docker compose exec backend ping -c 2 8.8.8.8
docker compose exec backend nslookup db.vwhxzxayzpdfmpnnzslq.supabase.co
```

## Current Status
- ✅ Host machine CAN reach database
- ❌ Docker container CANNOT reach database
- This is a Docker Desktop networking configuration issue

## Recommended Solution
For development on macOS, run the backend locally without Docker:
```bash
cd backend
./mvnw spring-boot:run
```

The backend will run on `http://localhost:8081` and can connect to Supabase.









