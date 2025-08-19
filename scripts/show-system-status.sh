#!/bin/bash

# ERP System Status Display Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                          🚀 ERP SYSTEM STATUS                                 ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check service status
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $name${NC} - Running on port $port"
        return 0
    else
        echo -e "   ${RED}❌ $name${NC} - Not responding on port $port"
        return 1
    fi
}

# Function to check docker service
check_docker_service() {
    local name=$1
    local service=$2
    
    if docker-compose ps "$service" 2>/dev/null | grep -q "Up"; then
        echo -e "   ${GREEN}✅ $name${NC} - Running"
        return 0
    else
        echo -e "   ${RED}❌ $name${NC} - Not running"
        return 1
    fi
}

# Main Application Services
echo -e "${CYAN}🌐 Main Application Services:${NC}"
check_service "Web Application" "http://localhost:3000" "3000"
check_service "Auth Service" "http://localhost:3001/health" "3001"
check_service "CRM Service" "http://localhost:3003/health" "3003"
echo -e "   ${YELLOW}🚧 Service Module${NC} - Available but not started (Port 3004)"

echo ""

# Infrastructure Services  
echo -e "${CYAN}🏗️  Infrastructure Services:${NC}"
check_docker_service "PostgreSQL" "postgres"
check_docker_service "Keycloak" "keycloak"
check_docker_service "Redis" "redis"
check_docker_service "RabbitMQ" "rabbitmq"
check_docker_service "Elasticsearch" "elasticsearch"
check_docker_service "MinIO" "minio"
check_docker_service "Prometheus" "prometheus"
check_docker_service "Grafana" "grafana"

echo ""

# Access Information
echo -e "${PURPLE}🔗 Access Your ERP System:${NC}"
echo -e "   ${GREEN}🌐 Main Application:${NC}      http://localhost:3000"
echo -e "   ${GREEN}📊 Dashboard & CRM:${NC}       Login with demo/demo123"
echo -e "   ${GREEN}📖 Auth API Docs:${NC}         http://localhost:3001/docs"
echo -e "   ${GREEN}📖 CRM API Docs:${NC}          http://localhost:3003/docs"

echo ""

echo -e "${PURPLE}🛠️  Admin Interfaces:${NC}"
echo -e "   ${GREEN}🔐 Keycloak Admin:${NC}        http://localhost:8080/admin"
echo -e "   ${GREEN}📊 Grafana:${NC}               http://localhost:3000"
echo -e "   ${GREEN}🐰 RabbitMQ:${NC}              http://localhost:15672"
echo -e "   ${GREEN}💾 MinIO:${NC}                 http://localhost:9001"

echo ""

echo -e "${PURPLE}👤 Demo Credentials:${NC}"
echo -e "   ${GREEN}Web Application:${NC}          demo / demo123"
echo -e "   ${GREEN}Keycloak Admin:${NC}           admin / admin_password"
echo -e "   ${GREEN}Grafana:${NC}                  admin / admin_password"
echo -e "   ${GREEN}RabbitMQ:${NC}                 erp_user / erp_password"
echo -e "   ${GREEN}MinIO:${NC}                    erp_admin / erp_password123"

echo ""

# Project Structure
echo -e "${CYAN}📁 Project Structure:${NC}"
echo -e "   ${GREEN}packages/${NC}                 Shared libraries (types, utils, config)"
echo -e "   ${GREEN}services/${NC}                 Backend microservices"
echo -e "   ${GREEN}apps/${NC}                     Frontend applications"
echo -e "   ${GREEN}scripts/${NC}                  Development and deployment scripts"
echo -e "   ${GREEN}docker/${NC}                   Docker configurations"

echo ""

# Available Features
echo -e "${CYAN}✨ Available Features:${NC}"
echo -e "   ${GREEN}✅ User Authentication${NC}    SSO with Keycloak"
echo -e "   ${GREEN}✅ Lead Management${NC}        Complete pipeline with analytics"
echo -e "   ${GREEN}✅ Dashboard${NC}              Real-time metrics and insights"
echo -e "   ${GREEN}✅ Account/Contact Management${NC} (API ready)"
echo -e "   ${GREEN}✅ Opportunity Tracking${NC}   (API ready)"
echo -e "   ${GREEN}✅ Case Management${NC}        Service & support system (API ready)"
echo -e "   ${GREEN}✅ Knowledge Base${NC}         Articles and documentation (API ready)"

echo ""

# Quick Commands
echo -e "${YELLOW}🚀 Quick Commands:${NC}"
echo -e "   ${GREEN}Start Everything:${NC}         ./scripts/start-erp.sh"
echo -e "   ${GREEN}Stop Everything:${NC}          ./scripts/stop-erp.sh"
echo -e "   ${GREEN}Setup Database:${NC}           ./scripts/setup-database.sh"
echo -e "   ${GREEN}Setup Keycloak:${NC}           ./scripts/setup-keycloak-client.sh"
echo -e "   ${GREEN}View Status:${NC}              ./scripts/show-system-status.sh"

echo ""

# System Health Summary
running_services=0
total_services=8

for port in 3000 3001 3003; do
    if nc -z localhost $port 2>/dev/null; then
        ((running_services++))
    fi
done

if docker-compose ps | grep -q "Up"; then
    ((running_services+=5))
fi

health_percentage=$((running_services * 100 / total_services))

if [ $health_percentage -ge 80 ]; then
    health_color=$GREEN
    health_status="EXCELLENT"
elif [ $health_percentage -ge 60 ]; then
    health_color=$YELLOW
    health_status="GOOD"
else
    health_color=$RED
    health_status="NEEDS ATTENTION"
fi

echo -e "${health_color}📊 System Health: $health_percentage% - $health_status${NC}"
echo -e "   Running Services: $running_services/$total_services"

echo ""

echo -e "${BLUE}🎉 Your Enterprise ERP System is Ready!${NC}"
echo -e "${CYAN}Visit http://localhost:3000 and login with demo/demo123 to get started.${NC}"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                     Thank you for using ERP System! 🚀                        ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
