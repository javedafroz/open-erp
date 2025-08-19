#!/bin/bash

# ERP Development Environment Startup Script
set -e

echo "🚀 Starting ERP Development Environment..."

# Function to wait for a service with timeout (macOS/Linux compatible)
wait_for_service() {
    local url=$1
    local timeout_seconds=$2
    local service_name=$3
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    local count=0
    while [ $count -lt $timeout_seconds ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        sleep 5
        count=$((count + 5))
        
        # Show progress every 30 seconds
        if [ $((count % 30)) -eq 0 ] && [ $count -lt $timeout_seconds ]; then
            echo "   Still waiting for $service_name... (${count}s elapsed)"
        fi
    done
    
    echo "❌ $service_name failed to start within $timeout_seconds seconds"
    echo "💡 Try checking Docker logs: docker-compose logs $service_name"
    return 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists, if not copy from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration before continuing."
    echo "Press Enter to continue or Ctrl+C to exit..."
    read
fi

# Start infrastructure services
echo "🐳 Starting infrastructure services (PostgreSQL, Redis, Keycloak, etc.)..."
docker-compose up -d postgres keycloak-postgres redis rabbitmq elasticsearch minio

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Start Keycloak
echo "🔐 Starting Keycloak..."
docker-compose up -d keycloak

# Wait for Keycloak to be ready
wait_for_service "http://localhost:8080/health/ready" 300 "Keycloak" || {
    exit 1
}

# Start monitoring services
echo "📊 Starting monitoring services..."
docker-compose up -d prometheus grafana

# Install dependencies for all packages
echo "📦 Installing dependencies..."
npm install

# Build shared packages
echo "🔨 Building shared packages..."
npm run build --workspace=packages/shared
npm run build --workspace=packages/utils
npm run build --workspace=packages/types

echo "✅ Development environment is ready!"
echo ""
echo "🌟 Services available:"
echo "   📊 Grafana Dashboard: http://localhost:3000 (admin/admin_password)"
echo "   🔐 Keycloak Admin: http://localhost:8080/admin (admin/admin_password)"
echo "   🐰 RabbitMQ Management: http://localhost:15672 (erp_user/erp_password)"
echo "   🗄️  MinIO Console: http://localhost:9001 (erp_admin/erp_password123)"
echo "   🔍 Elasticsearch: http://localhost:9200"
echo "   📈 Prometheus: http://localhost:9090"
echo ""
echo "💡 Next steps:"
echo "   1. Configure Keycloak realm and clients"
echo "   2. Start individual services: npm run dev --workspace=services/auth-service"
echo "   3. Start frontend applications: npm run dev --workspace=apps/web-app"
echo ""
echo "🛑 To stop all services: docker-compose down"
