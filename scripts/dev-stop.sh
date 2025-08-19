#!/bin/bash

# ERP Development Environment Stop Script
set -e

echo "🛑 Stopping ERP Development Environment..."

# Stop all Docker services
echo "🐳 Stopping all Docker services..."
docker-compose down

# Optional: Remove volumes (uncomment if you want to reset data)
# echo "🗑️  Removing all data volumes..."
# docker-compose down -v

echo "✅ Development environment stopped successfully!"
echo ""
echo "💡 To start again: ./scripts/dev-start.sh"
echo "🗑️  To remove all data: docker-compose down -v"
