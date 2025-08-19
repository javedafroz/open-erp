# 🚀 ERP System Quick Start Guide

Get your Enterprise ERP system running in minutes!

## 📋 Prerequisites

- **Docker** and Docker Compose
- **Git**
- **Node.js** >= 18.0.0 *(optional - only needed for development)*
- **npm** >= 9.0.0 *(optional - only needed for development)*

## 🚀 Super Quick Start (2 Minutes) - **RECOMMENDED**

### Option A: Complete Docker Setup (Easiest)

```bash
# 1. Start everything with Docker Compose
docker-compose up --build -d

# 2. Setup database (one-time only)
./scripts/setup-database.sh

# 3. Setup Keycloak client (one-time only)
./scripts/setup-keycloak-client.sh
```

**🎉 That's it!** Your complete ERP system is running!

### Option B: Master Script (Alternative)

```bash
# Start everything with our master script
./scripts/start-erp.sh
```

This single command will:
- ✅ Start all Docker infrastructure
- ✅ Initialize the database
- ✅ Configure Keycloak
- ✅ Start all backend services
- ✅ Start the web application

---

## 🏗️ Manual Development Setup (for developers)

If you want to run services individually for development:

### 1. Start the Infrastructure

```bash
# Start all backend services (databases, Keycloak, monitoring)
./scripts/dev-start.sh
```

This will start:
- ✅ PostgreSQL database
- ✅ Keycloak (Identity & Access Management)
- ✅ Redis (caching)
- ✅ RabbitMQ (messaging)
- ✅ Elasticsearch (search)
- ✅ MinIO (file storage)
- ✅ Prometheus & Grafana (monitoring)

### 2. Initialize the Database

```bash
# Run database migrations
./scripts/setup-database.sh
```

### 3. Setup Keycloak Frontend Client

```bash
# Configure Keycloak for the web application
./scripts/setup-keycloak-client.sh
```

### 4. Setup Frontend Environment

```bash
# Copy environment configuration
cp apps/web-app/env.example apps/web-app/.env
```

### 5. Start the Services

```bash
# Terminal 1: Start Authentication Service
npm run dev --workspace=services/auth-service

# Terminal 2: Start CRM Service  
npm run dev --workspace=services/crm-service

# Terminal 3: Start Web Application
npm run dev --workspace=apps/web-app
```

## 🎉 Your ERP System is Ready!

### 🌟 Main Application

| Service | URL | Purpose |
|---------|-----|---------|
| **🌐 Web Application** | **http://localhost:3000** | **Main ERP Interface** |

### 🔧 Backend Services

| Service | URL | Purpose | Status |
|---------|-----|---------|--------|
| **Auth Service** | http://localhost:3001 | Authentication & user management | 🐳 Dockerized |
| **CRM Service** | http://localhost:3003 | Leads, accounts, contacts, opportunities | 🐳 Dockerized |
| **API Docs (Auth)** | http://localhost:3001/docs | Authentication API documentation | 📚 Available |
| **API Docs (CRM)** | http://localhost:3003/docs | CRM API documentation | 📚 Available |

### 🏗️ Infrastructure Services

| Service | URL | Purpose | Status |
|---------|-----|---------|--------|
| **PostgreSQL** | localhost:5432 | Main database | 🐳 Dockerized |
| **Keycloak** | http://localhost:8080 | Identity & Access Management | 🐳 Dockerized |
| **Redis** | localhost:6379 | Caching & sessions | 🐳 Dockerized |
| **RabbitMQ** | http://localhost:15672 | Message queue | 🐳 Dockerized |
| **Elasticsearch** | http://localhost:9200 | Search engine | 🐳 Dockerized |
| **MinIO** | http://localhost:9000 | Object storage | 🐳 Dockerized |
| **Prometheus** | http://localhost:9090 | Metrics collection | 🐳 Dockerized |
| **Grafana** | http://localhost:3002 | Monitoring dashboards | 🐳 Dockerized |

## 🔐 Authentication

### Web Application Login

1. **Open the Web Application**: http://localhost:3000
2. **Login Credentials**:
   - **Username**: `demo`
   - **Password**: `demo123`

The web application uses Keycloak SSO for authentication, so you'll be redirected to the Keycloak login page.

### API Access Token (for direct API calls)

```bash
curl -X POST http://localhost:8080/realms/erp-system/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo" \
  -d "password=demo123" \
  -d "grant_type=password" \
  -d "client_id=erp-frontend"
```

Use the returned `access_token` for direct API calls.

## 📊 CRM Operations

### Using the Web Interface

1. **Dashboard**: View key metrics and recent activities
2. **Lead Management**: Navigate to **CRM > Leads**
   - Create, edit, and manage leads
   - Filter and search functionality
   - Bulk operations (assign, update status)
   - Lead conversion workflow
3. **Analytics**: Real-time lead pipeline and performance metrics

### API Operations (for developers)

#### Create a Lead

```bash
curl -X POST http://localhost:3003/api/v1/crm/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "company": "Acme Corp",
    "source": "website",
    "phoneNumber": "+1-555-0123"
  }'
```

#### Search Leads

```bash
curl "http://localhost:3003/api/v1/crm/leads?search=John&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Convert Lead to Customer

```bash
curl -X POST http://localhost:3003/api/v1/crm/leads/{leadId}/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "createAccount": true,
    "accountName": "Acme Corporation",
    "createContact": true,
    "createOpportunity": true,
    "opportunityName": "Acme - Software Deal",
    "opportunityAmount": 50000
  }'
```

## 🎛️ Admin Interfaces

### Keycloak Admin Console
- **URL**: http://localhost:8080/admin
- **Credentials**: admin / admin_password
- **Purpose**: User management, roles, permissions

### Grafana Dashboards  
- **URL**: http://localhost:3002
- **Credentials**: admin / admin_password
- **Purpose**: System monitoring and metrics

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Credentials**: erp_user / erp_password
- **Purpose**: Message queue monitoring

### MinIO Console
- **URL**: http://localhost:9001
- **Credentials**: erp_admin / erp_password123
- **Purpose**: File storage management

## 🛠️ Development Commands

### Docker Commands

```bash
# View all running containers
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Follow logs in real-time
docker-compose logs -f [service-name]

# Execute commands in running containers
docker-compose exec auth-service npm run test
docker-compose exec crm-service npm run migration:generate -- -n NewFeature

# Rebuild specific service
docker-compose build [service-name]

# Scale services (if needed)
docker-compose up --scale auth-service=2
```

### Local Development Commands

```bash
# Build everything
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Database Operations

```bash
# Connect to database directly
docker-compose exec postgres psql -U erp_user -d erp_db

# Generate new migration
docker-compose exec crm-service npm run migration:generate -- -n AddNewColumn

# Run migrations
docker-compose exec crm-service npm run migration:run

# Revert last migration
docker-compose exec crm-service npm run migration:revert

# Database backup
docker-compose exec postgres pg_dump -U erp_user erp_db > backup.sql

# Database restore
docker-compose exec -T postgres psql -U erp_user -d erp_db < backup.sql
```

## 📚 API Documentation

Visit the interactive API documentation:

- **Authentication Service**: http://localhost:3001/docs
- **CRM Service**: http://localhost:3003/docs

## 🧪 Sample Data

The system includes sample data for testing:

### Sample Lead
- **Name**: John Doe
- **Email**: john.doe@example.com
- **Company**: Acme Corp
- **Status**: New

### Sample Account
- **Name**: Acme Corporation
- **Type**: Customer
- **Industry**: Technology

### Sample Contact
- **Name**: Jane Smith
- **Email**: jane.smith@acme.com
- **Title**: CEO

### Sample Opportunity
- **Name**: Acme Corp - Software License Deal
- **Amount**: $50,000
- **Stage**: Proposal
- **Probability**: 80%

## 🚫 Stopping the System

### Docker Compose Setup

```bash
# Stop all services (recommended)
docker-compose down

# Stop and remove all data (complete reset)
docker-compose down -v
```

### Master Script Setup

```bash
# Stop all services started with start-erp.sh
./scripts/stop-erp.sh
```

### Manual Development Setup

```bash
# Stop all Docker services
./scripts/dev-stop.sh

# Or stop individual services with Ctrl+C in their terminals
```

## 🔧 Troubleshooting

### Docker Setup Issues

```bash
# Check all container status
docker-compose ps

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs service-name

# Restart specific service
docker-compose restart service-name

# Rebuild and restart everything
docker-compose up --build --force-recreate
```

### Services Won't Start
1. **Check Docker**: `docker --version` and `docker-compose --version`
2. **Check ports**: `lsof -i :3000 -i :3001 -i :3003 -i :8080`
3. **Check container status**: `docker-compose ps`
4. **View container logs**: `docker-compose logs`

### Database Connection Issues
1. **Check PostgreSQL container**: `docker-compose ps postgres`
2. **Check database logs**: `docker-compose logs postgres`
3. **Test connection**: `docker-compose exec postgres psql -U erp_user -d erp_db -c "SELECT 1;"`
4. **Reset database**: `docker-compose down -v && docker-compose up -d postgres`

### Authentication Issues
1. **Check Keycloak health**: `curl http://localhost:8080/health/ready`
2. **Check Keycloak logs**: `docker-compose logs keycloak`
3. **Verify Redis**: `docker-compose ps redis`
4. **Reset Keycloak setup**: Run `./scripts/setup-keycloak-client.sh` again

### Web Application Issues
1. **Check if running**: `curl http://localhost:3000`
2. **View browser console**: Check for JavaScript errors
3. **Clear browser cache**: Hard refresh with Ctrl+Shift+R
4. **Restart web container**: `docker-compose restart web-app`

### Performance Issues
1. **Check system resources**: `docker stats`
2. **Monitor container health**: `docker-compose ps`
3. **View resource usage**: `docker system df`
4. **Clean up unused resources**: `docker system prune`

## 📖 What's Next?

1. **Explore the APIs** using the Swagger documentation
2. **Create your own data** using the CRM endpoints
3. **Customize the services** for your business needs
4. **Add new modules** following the established patterns
5. **Implement the frontend** using React/Vue.js with Keycloak

## 🏗️ Architecture Overview

### 🐳 Docker-First Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Auth Service  │    │   CRM Service   │
│   (React + Vite)│────│   (Fastify)     │────│   (Fastify)     │
│   🐳 Container  │    │   🐳 Container  │    │   🐳 Container  │
│   Port 3000     │    │   Port 3001     │    │   Port 3003     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Keycloak     │    │   PostgreSQL    │    │     Redis       │
│   🐳 Container  │    │   🐳 Container  │    │   🐳 Container  │
│   Port 8080     │    │   Port 5432     │    │   Port 6379     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    RabbitMQ     │    │ Elasticsearch   │    │      MinIO      │
│   🐳 Container  │    │   🐳 Container  │    │   🐳 Container  │
│   Port 5672     │    │   Port 9200     │    │   Port 9000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │     Grafana     │
│   🐳 Container  │    │   🐳 Container  │
│   Port 9090     │    │   Port 3002     │
└─────────────────┘    └─────────────────┘
```

### 🔧 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify + TypeScript + TypeORM
- **Authentication**: Keycloak (OAuth 2.0/OpenID Connect)
- **Database**: PostgreSQL 15 with advanced features
- **Caching**: Redis 7
- **Message Queue**: RabbitMQ 3
- **Search**: Elasticsearch 8
- **Storage**: MinIO (S3-compatible)
- **Monitoring**: Prometheus + Grafana
- **Container**: Docker + Docker Compose
- **Package Manager**: npm workspaces (monorepo)

## 🤝 Need Help?

- **Documentation**: Check the `/docs` directory
- **API Reference**: Visit the Swagger UI endpoints
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions

---

**🎉 Welcome to your Enterprise ERP System!** 

You now have a production-ready, scalable ERP system with authentication, CRM capabilities, and comprehensive monitoring. Start building your business logic on this solid foundation!
