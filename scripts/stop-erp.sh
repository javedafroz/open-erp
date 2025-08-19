#!/bin/bash

# ERP System Complete Stop Script
set -e

echo "🛑 Stopping ERP System..."
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service() {
    local name=$1
    local pidfile="logs/${name}.pid"
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}🔄 Stopping $name (PID: $pid)...${NC}"
            kill "$pid"
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force stopping $name...${NC}"
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ $name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $name was not running${NC}"
        fi
        
        rm -f "$pidfile"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $name${NC}"
    fi
}

# Function to stop service by port
stop_by_port() {
    local name=$1
    local port=$2
    
    echo -e "${YELLOW}🔄 Stopping $name on port $port...${NC}"
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs -r kill -TERM
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$remaining_pids" ]; then
            echo "$remaining_pids" | xargs -r kill -9
        fi
        
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No processes found on port $port${NC}"
    fi
}

# Stop frontend and backend services
echo -e "${BLUE}🌐 Stopping web services...${NC}"

# Stop by PID files first (more graceful)
stop_service "web-app"
stop_service "crm-service"
stop_service "auth-service"

# Fallback: stop by ports
echo -e "${BLUE}🔍 Checking for remaining processes on ports...${NC}"
stop_by_port "Web Application" 3000
stop_by_port "CRM Service" 3003
stop_by_port "Auth Service" 3001

# Stop infrastructure services
echo -e "\n${BLUE}🐳 Stopping infrastructure services...${NC}"
if [ -f "scripts/dev-stop.sh" ]; then
    ./scripts/dev-stop.sh
else
    echo -e "${YELLOW}⚠️  Infrastructure stop script not found${NC}"
    echo -e "${BLUE}🔄 Stopping Docker services manually...${NC}"
    docker-compose down 2>/dev/null || echo -e "${YELLOW}⚠️  Docker Compose not running${NC}"
fi

# Clean up log files (optional)
read -p "🗑️  Delete log files? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf logs/*.log
    echo -e "${GREEN}✅ Log files cleaned${NC}"
else
    echo -e "${YELLOW}📁 Log files preserved in ./logs/${NC}"
fi

# Clean up PID files
rm -f logs/*.pid 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 ERP System stopped successfully!${NC}"
echo -e "===================================="
echo ""
echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo -e "   ${GREEN}Start ERP:${NC}               ./scripts/start-erp.sh"
echo -e "   ${GREEN}View Docker Status:${NC}      docker-compose ps"
echo -e "   ${GREEN}Clean Everything:${NC}        docker-compose down -v --remove-orphans"
echo ""
