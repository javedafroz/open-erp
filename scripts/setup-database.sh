#!/bin/bash

# ERP System Database Setup Script
set -e

echo "🗄️  Setting up ERP System Database..."

# Check if PostgreSQL is running
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL is not running. Please start it first:"
    echo "   ./scripts/dev-start.sh"
    exit 1
fi

echo "⏳ Waiting for PostgreSQL to be ready..."
count=0
max_attempts=30  # 60 seconds with 2-second intervals
while [ $count -lt $max_attempts ]; do
    if docker-compose exec postgres pg_isready -U erp_user -d erp_db >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    sleep 2
    count=$((count + 1))
    if [ $((count % 10)) -eq 0 ]; then
        echo "   Still waiting for PostgreSQL... (${count}/30 attempts)"
    fi
done

if [ $count -eq $max_attempts ]; then
    echo "❌ PostgreSQL failed to be ready within 60 seconds"
    exit 1
fi

echo "📋 Running database migrations..."

# Run the CRM schema migration
echo "   Creating CRM schema and tables..."
docker-compose exec -T postgres psql -U erp_user -d erp_db -f - < scripts/db/migrations/001-create-crm-schema.sql

echo "   Fixing database triggers..."
docker-compose exec -T postgres psql -U erp_user -d erp_db -f - < scripts/db/migrations/002-fix-triggers.sql

# Verify the installation
echo "✅ Verifying database setup..."
docker-compose exec -T postgres psql -U erp_user -d erp_db -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'crm'
ORDER BY tablename;
"

echo "📊 Database statistics..."
docker-compose exec -T postgres psql -U erp_user -d erp_db -c "
SELECT 
    'Leads' as entity,
    count(*) as count
FROM crm.leads
UNION ALL
SELECT 
    'Accounts' as entity,
    count(*) as count
FROM crm.accounts
UNION ALL
SELECT 
    'Contacts' as entity,
    count(*) as count
FROM crm.contacts
UNION ALL
SELECT 
    'Opportunities' as entity,
    count(*) as count
FROM crm.opportunities;
" 2>/dev/null || echo "   Note: Opportunities table will be available after application starts"

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Available tables in CRM schema:"
echo "   • leads - Lead management"
echo "   • accounts - Account/company management"  
echo "   • contacts - Contact management"
echo "   • opportunities - Sales opportunity tracking"
echo ""
echo "💡 Next steps:"
echo "   1. Start the services:"
echo "      npm run dev --workspace=services/auth-service"
echo "      npm run dev --workspace=services/crm-service"
echo "   2. Visit API documentation:"
echo "      http://localhost:3001/docs (Auth Service)"
echo "      http://localhost:3003/docs (CRM Service)"
echo "   3. Check the QUICKSTART.md guide for examples"
