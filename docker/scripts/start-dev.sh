#!/bin/bash
# ===============================================
# Start Development Environment
# ===============================================

set -e

echo "================================================="
echo "Starting Soldent Development Environment"
echo "================================================="

# Check if .env files exist
if [ ! -f "../backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp ../backend/.env.example ../backend/.env
    echo "Please update backend/.env with your configuration"
fi

if [ ! -f "../frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.example..."
    cp ../frontend/.env.example ../frontend/.env.local
    echo "Please update frontend/.env.local with your configuration"
fi

if [ ! -f ".env" ]; then
    echo "Creating docker/.env from .env.example..."
    cp .env.example .env
    echo "Please update docker/.env with your configuration"
fi

# Start services
echo ""
echo "Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U soldent_dev -d soldent_dev; do
    sleep 2
done

echo ""
echo "================================================="
echo "Development environment started successfully!"
echo "================================================="
echo ""
echo "Services:"
echo "  Frontend:          http://localhost:3000"
echo "  Backend:           http://localhost:3001"
echo "  Backend API:       http://localhost:3001/api"
echo "  pgAdmin:           http://localhost:5050"
echo "  Redis Commander:   http://localhost:8081"
echo ""
echo "Database:"
echo "  Host:     localhost"
echo "  Port:     5433"
echo "  Database: soldent_dev"
echo "  User:     soldent_dev"
echo ""
echo "Useful commands:"
echo "  View logs:         docker-compose -f docker-compose.dev.yml logs -f"
echo "  Stop services:     docker-compose -f docker-compose.dev.yml down"
echo "  Restart service:   docker-compose -f docker-compose.dev.yml restart [service]"
echo ""
echo "Next steps:"
echo "  1. Run database migrations:"
echo "     docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev"
echo ""
