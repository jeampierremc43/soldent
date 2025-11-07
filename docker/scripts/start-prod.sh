#!/bin/bash
# ===============================================
# Start Production Environment
# ===============================================

set -e

echo "================================================="
echo "Starting Soldent Production Environment"
echo "================================================="

# Check if .env files exist
if [ ! -f "../backend/.env" ]; then
    echo "ERROR: backend/.env not found!"
    echo "Please create it from .env.example and configure it"
    exit 1
fi

if [ ! -f "../frontend/.env.local" ]; then
    echo "ERROR: frontend/.env.local not found!"
    echo "Please create it from .env.example and configure it"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "ERROR: docker/.env not found!"
    echo "Please create it from .env.example and configure it"
    exit 1
fi

# Build images
echo ""
echo "Building Docker images..."
docker-compose build

# Start services
echo ""
echo "Starting Docker services..."
docker-compose up -d

# Wait for database to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U soldent_user -d soldent; do
    sleep 2
done

# Run migrations
echo ""
echo "Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy

echo ""
echo "================================================="
echo "Production environment started successfully!"
echo "================================================="
echo ""
echo "Services:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend:     http://localhost:3001"
echo "  Backend API: http://localhost:3001/api"
echo ""
echo "Useful commands:"
echo "  View logs:       docker-compose logs -f"
echo "  Stop services:   docker-compose down"
echo "  Restart service: docker-compose restart [service]"
echo ""
