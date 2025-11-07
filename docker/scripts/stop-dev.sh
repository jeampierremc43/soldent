#!/bin/bash
# ===============================================
# Stop Development Environment
# ===============================================

set -e

echo "================================================="
echo "Stopping Soldent Development Environment"
echo "================================================="

# Stop services
docker-compose -f docker-compose.dev.yml down

echo ""
echo "Development environment stopped successfully!"
echo ""
echo "To remove volumes as well, run:"
echo "  docker-compose -f docker-compose.dev.yml down -v"
echo ""
