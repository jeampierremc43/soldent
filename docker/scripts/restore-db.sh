#!/bin/bash
# ===============================================
# Database Restore Script
# ===============================================

set -e

# Configuration
BACKUP_DIR="./backups"

# Get database credentials from .env
source .env

echo "================================================="
echo "Database Restore - Soldent"
echo "================================================="

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo ""
echo "Available backups:"
ls -lh "$BACKUP_DIR" | grep ".sql.gz"
echo ""

# Prompt for backup file
read -p "Enter backup filename (or 'latest' for most recent): " BACKUP_FILE

if [ "$BACKUP_FILE" = "latest" ]; then
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/soldent_backup_*.sql.gz | head -1)
    echo "Using latest backup: $(basename "$BACKUP_FILE")"
else
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restore
echo ""
echo "WARNING: This will restore the database from backup."
echo "Current data will be lost!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Decompress backup
echo ""
echo "Decompressing backup..."
TEMP_SQL="/tmp/restore_$(date +%s).sql"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

# Drop and recreate database
echo ""
echo "Recreating database..."
docker-compose exec -T postgres psql -U "${POSTGRES_USER}" -d postgres <<EOF
DROP DATABASE IF EXISTS "${POSTGRES_DB}";
CREATE DATABASE "${POSTGRES_DB}";
GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";
EOF

# Restore backup
echo ""
echo "Restoring database..."
docker-compose exec -T postgres psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    < "$TEMP_SQL"

# Clean up
rm "$TEMP_SQL"

echo ""
echo "================================================="
echo "Database restored successfully!"
echo "================================================="
echo ""
