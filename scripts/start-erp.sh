#!/bin/bash

# ERP System Complete Startup Script
set -e

echo "🚀 Starting Complete ERP System..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to wait for service (macOS/Linux compatible)
wait_for_service() {
    local url=$1
    local name=$2
    local timeout_seconds=${3:-60}
    
    echo -e "${YELLOW}⏳ Waiting for $name to be ready...${NC}"
    
    local count=0
    while [ $count -lt $timeout_seconds ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready!${NC}"
            return 0
        fi
        sleep 2
        count=$((count + 2))
        
        # Show progress every 20 seconds
        if [ $((count % 20)) -eq 0 ] && [ $count -lt $timeout_seconds ]; then
            echo -e "${YELLOW}   Still waiting for $name... (${count}s elapsed)${NC}"
        fi
    done
    
    echo -e "${RED}❌ $name failed to start within $timeout_seconds seconds${NC}"
    return 1
}

# Function to start service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local logfile="logs/${name}.log"
    
    # Create logs directory
    mkdir -p logs
    
    echo -e "${BLUE}🔄 Starting $name...${NC}"
    
    # Kill existing process on port if exists
    if port_in_use $port; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Stopping existing process...${NC}"
        pkill -f ".*:$port" 2>/dev/null || true
        sleep 2
    fi
    
    # Start service
    nohup bash -c "$command" > "$logfile" 2>&1 &
    local pid=$!
    echo "$pid" > "logs/${name}.pid"
    
    # Wait a moment for startup
    sleep 3
    
    # Check if process is still running
    if kill -0 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✅ $name started (PID: $pid, Port: $port)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name failed to start. Check $logfile for details.${NC}"
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites satisfied${NC}"

# Step 1: Start infrastructure services
echo -e "\n${BLUE}🐳 Step 1: Starting infrastructure services...${NC}"
./scripts/dev-start.sh

# Step 2: Setup database
echo -e "\n${BLUE}🗄️  Step 2: Setting up database...${NC}"
if [ -f "scripts/setup-database.sh" ]; then
    ./scripts/setup-database.sh
else
    echo -e "${YELLOW}⚠️  Database setup script not found, skipping...${NC}"
fi

# Step 3: Setup Keycloak client
echo -e "\n${BLUE}🔐 Step 3: Setting up Keycloak client...${NC}"
if [ -f "scripts/setup-keycloak-client.sh" ]; then
    ./scripts/setup-keycloak-client.sh
else
    echo -e "${YELLOW}⚠️  Keycloak setup script not found, skipping...${NC}"
fi

# Step 4: Setup frontend environment
echo -e "\n${BLUE}⚙️  Step 4: Setting up frontend environment...${NC}"
if [ ! -f "apps/web-app/.env" ] && [ -f "apps/web-app/env.example" ]; then
    cp apps/web-app/env.example apps/web-app/.env
    echo -e "${GREEN}✅ Frontend environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env already exists or template not found${NC}"
fi

# Step 5: Build all packages
echo -e "\n${BLUE}🔨 Step 5: Building packages...${NC}"
echo -e "${YELLOW}⏳ Building shared packages...${NC}"
npm run build --workspace=packages/shared --silent
npm run build --workspace=packages/utils --silent
npm run build --workspace=packages/types --silent
echo -e "${GREEN}✅ Packages built successfully${NC}"

# Step 6: Start backend services
echo -e "\n${BLUE}🖥️  Step 6: Starting backend services...${NC}"

# Start Auth Service
start_service "auth-service" "cd services/auth-service && npm run dev" 3001

# Start CRM Service  
start_service "crm-service" "cd services/crm-service && npm run dev" 3003

# Wait for backend services to be ready
wait_for_service "http://localhost:3001/health" "Auth Service" 30
wait_for_service "http://localhost:3003/health" "CRM Service" 30

# Step 7: Start frontend application
echo -e "\n${BLUE}🌐 Step 7: Starting web application...${NC}"
start_service "web-app" "cd apps/web-app && npm run dev" 3000

# Wait for frontend to be ready
wait_for_service "http://localhost:3000" "Web Application" 30

# Success message
echo -e "\n${GREEN}🎉 ERP System started successfully!${NC}"
echo -e "=================================="
echo ""
echo -e "${BLUE}📱 Access Your ERP System:${NC}"
echo -e "   ${GREEN}🌐 Web Application:${NC}     http://localhost:3000"
echo -e "   ${GREEN}📖 Auth API Docs:${NC}       http://localhost:3001/docs"  
echo -e "   ${GREEN}📖 CRM API Docs:${NC}        http://localhost:3003/docs"
echo ""
echo -e "${BLUE}🔐 Login Credentials:${NC}"
echo -e "   ${GREEN}Username:${NC} demo"
echo -e "   ${GREEN}Password:${NC} demo123"
echo ""
echo -e "${BLUE}🎛️  Admin Interfaces:${NC}"
echo -e "   ${GREEN}Keycloak Admin:${NC}         http://localhost:8080/admin (admin/admin_password)"
echo -e "   ${GREEN}Grafana:${NC}                http://localhost:3000 (admin/admin_password)"  
echo -e "   ${GREEN}RabbitMQ:${NC}               http://localhost:15672 (erp_user/erp_password)"
echo ""
echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo -e "   ${GREEN}Stop ERP:${NC}               ./scripts/stop-erp.sh"
echo -e "   ${GREEN}View Logs:${NC}              tail -f logs/*.log"
echo -e "   ${GREEN}Restart Service:${NC}        ./scripts/restart-service.sh <service-name>"
echo ""
echo -e "${GREEN}✨ Your Enterprise ERP System is ready for use!${NC}"
