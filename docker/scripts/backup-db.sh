#!/bin/bash
# ===============================================
# Database Backup Script
# ===============================================

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="soldent_backup_${TIMESTAMP}.sql"

# Get database credentials from .env
source .env

echo "================================================="
echo "Database Backup - Soldent"
echo "================================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo ""
echo "Creating backup: $BACKUP_FILE"

# Create backup
docker-compose exec -T postgres pg_dump \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
echo ""
echo "Compressing backup..."
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo ""
echo "================================================="
echo "Backup completed successfully!"
echo "================================================="
echo ""
echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
echo "Size: $(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)"
echo ""

# Keep only last 7 backups
echo "Cleaning old backups (keeping last 7)..."
cd "$BACKUP_DIR"
ls -t soldent_backup_*.sql.gz | tail -n +8 | xargs -r rm
cd ..

echo ""
echo "Available backups:"
ls -lh "$BACKUP_DIR"
echo ""
