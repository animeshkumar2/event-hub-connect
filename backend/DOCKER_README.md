# Docker Setup for Backend

## Quick Start

### Build and Run with Docker Compose

```bash
cd backend
docker compose up
```

This will:
1. Build the Spring Boot application
2. Start the backend on port 8081
3. Connect to Supabase PostgreSQL database

### Run in Background

```bash
docker compose up -d
```

### View Logs

```bash
docker compose logs -f backend
```

### Stop the Backend

```bash
docker compose down
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

## Testing the API

Once the backend is running:

```bash
# Test vendors endpoint
curl http://localhost:8081/api/vendors

# Test listings endpoint
curl http://localhost:8081/api/listings

# Test with filters
curl "http://localhost:8081/api/listings?category=photographer"
```

## Environment Variables

The database connection is configured via environment variables in `docker-compose.yml`:

- `SPRING_DATASOURCE_URL` - Supabase database URL
- `SPRING_DATASOURCE_USERNAME` - Database username (postgres)
- `SPRING_DATASOURCE_PASSWORD` - Database password

To change the database password, edit `docker-compose.yml` and update:
```yaml
- SPRING_DATASOURCE_PASSWORD=your-new-password
```

## Troubleshooting

### Port Already in Use

If port 8081 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "8082:8081"  # Use port 8082 on host
```

### Database Connection Issues

1. Verify database password in `docker-compose.yml`
2. Check Supabase database is accessible
3. View logs: `docker compose logs backend`

### Rebuild After Code Changes

```bash
docker compose down
docker compose up --build
```

## Production Considerations

For production, consider:
- Using environment files (`.env`) for secrets
- Setting up proper logging
- Configuring health checks
- Using Docker secrets for passwords





