#!/bin/bash

# =============================================================================
# Sync Database from Supabase to Local PostgreSQL
# =============================================================================
# This script exports schema and data from Supabase production database
# and imports it into your local PostgreSQL database.
#
# Usage: ./scripts/sync-from-supabase.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Supabase Production Database
SUPABASE_HOST="aws-1-ap-southeast-1.pooler.supabase.com"
SUPABASE_PORT="6543"
SUPABASE_USER="postgres.zxkejeertdrlgwcdzynr"
SUPABASE_PASSWORD="event@9060dbpassword"
SUPABASE_DB="postgres"

# Local Database
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_USER="pichotiy2501"
LOCAL_PASSWORD=""
LOCAL_DB="postgres"

# Temp files
DUMP_FILE="/tmp/supabase_dump_$(date +%Y%m%d_%H%M%S).sql"
CLEAN_DUMP_FILE="/tmp/supabase_dump_clean_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Supabase to Local Database Sync${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check for pg_dump version
PG_DUMP_PATH=""
if command -v /opt/homebrew/opt/postgresql@17/bin/pg_dump &> /dev/null; then
    PG_DUMP_PATH="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
elif command -v /opt/homebrew/opt/postgresql@16/bin/pg_dump &> /dev/null; then
    PG_DUMP_PATH="/opt/homebrew/opt/postgresql@16/bin/pg_dump"
elif command -v pg_dump &> /dev/null; then
    PG_DUMP_PATH="pg_dump"
else
    echo -e "${RED}Error: pg_dump not found. Install PostgreSQL 17:${NC}"
    echo "  brew install postgresql@17"
    exit 1
fi

echo -e "${GREEN}Using pg_dump: ${PG_DUMP_PATH}${NC}"

# Step 1: Export from Supabase
echo ""
echo -e "${YELLOW}Step 1: Exporting from Supabase...${NC}"
PGPASSWORD="${SUPABASE_PASSWORD}" ${PG_DUMP_PATH} \
    -h ${SUPABASE_HOST} \
    -p ${SUPABASE_PORT} \
    -U ${SUPABASE_USER} \
    -d ${SUPABASE_DB} \
    -n public \
    --no-owner \
    --no-privileges \
    --inserts \
    > "${DUMP_FILE}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to export from Supabase${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Export complete: ${DUMP_FILE}${NC}"

# Step 2: Clean the dump file
echo ""
echo -e "${YELLOW}Step 2: Cleaning dump file...${NC}"

# Remove \restrict lines and fix any issues
grep -v '\\restrict' "${DUMP_FILE}" | grep -v '\\unrestrict' > "${CLEAN_DUMP_FILE}"

echo -e "${GREEN}✓ Cleaned dump file: ${CLEAN_DUMP_FILE}${NC}"

# Step 3: Reset local database
echo ""
echo -e "${YELLOW}Step 3: Resetting local database...${NC}"

psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} << 'EOF'
-- Drop and recreate public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create uuid-ossp extension in public schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO pichotiy2501;
GRANT ALL ON SCHEMA public TO public;

-- Set search path
ALTER USER pichotiy2501 SET search_path TO public;
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to reset local database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Local database reset${NC}"

# Step 4: Import to local
echo ""
echo -e "${YELLOW}Step 4: Importing to local database...${NC}"

psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} \
    -f "${CLEAN_DUMP_FILE}" 2>&1 | grep -E "(ERROR|CREATE|INSERT)" | head -50

echo ""
echo -e "${GREEN}✓ Import complete${NC}"

# Step 5: Verify
echo ""
echo -e "${YELLOW}Step 5: Verifying import...${NC}"

TABLES=$(psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
CATEGORIES=$(psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} -t -c \
    "SET search_path TO public; SELECT COUNT(*) FROM categories;")
VENDORS=$(psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} -t -c \
    "SET search_path TO public; SELECT COUNT(*) FROM vendors;")
USERS=$(psql -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} -t -c \
    "SET search_path TO public; SELECT COUNT(*) FROM user_profiles;")

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Sync Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  Tables:     ${TABLES}"
echo -e "  Categories: ${CATEGORIES}"
echo -e "  Vendors:    ${VENDORS}"
echo -e "  Users:      ${USERS}"
echo ""

# Cleanup
rm -f "${DUMP_FILE}" "${CLEAN_DUMP_FILE}"
echo -e "${GREEN}✓ Temporary files cleaned up${NC}"
echo ""
echo -e "${YELLOW}Note: Restart your backend to use the new data${NC}"
