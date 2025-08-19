#!/bin/bash

# ERP System Keycloak Frontend Client Setup Script
set -e

echo "🔐 Setting up Keycloak Frontend Client..."

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-erp-system}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin_password}"
CLIENT_ID="${KEYCLOAK_FRONTEND_CLIENT_ID:-erp-frontend}"
CLIENT_NAME="ERP Frontend Application"
REDIRECT_URIS="http://localhost:3000/*"
WEB_ORIGINS="http://localhost:3000"
FRONTEND_BASE_URL="http://localhost:3000"

# Check if Keycloak is running
echo "⏳ Checking if Keycloak is available..."
count=0
max_attempts=30  # 60 seconds with 2-second intervals
while [ $count -lt $max_attempts ]; do
    if curl -s -f "${KEYCLOAK_URL}/health/ready" >/dev/null 2>&1; then
        echo "✅ Keycloak is ready!"
        break
    fi
    sleep 2
    count=$((count + 1))
    if [ $((count % 10)) -eq 0 ]; then
        echo "   Still waiting for Keycloak... (${count}/30 attempts)"
    fi
done

if [ $count -eq $max_attempts ]; then
    echo "❌ Keycloak is not available. Please start it first:"
    echo "   ./scripts/dev-start.sh"
    exit 1
fi

echo "✅ Keycloak is ready!"

# Function to get access token
get_access_token() {
    local token_response=$(curl -s -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=${ADMIN_USER}" \
        -d "password=${ADMIN_PASSWORD}" \
        -d "grant_type=password" \
        -d "client_id=admin-cli" \
        "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token")
    
    if [[ $? -ne 0 ]]; then
        echo "❌ Failed to get access token from Keycloak"
        exit 1
    fi
    
    echo "$token_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
}

# Get access token
echo "🔑 Getting admin access token..."
ACCESS_TOKEN=$(get_access_token)

if [[ -z "$ACCESS_TOKEN" ]]; then
    echo "❌ Failed to obtain access token"
    exit 1
fi

echo "✅ Access token obtained"

# Check if realm exists
echo "🏰 Checking if realm '${KEYCLOAK_REALM}' exists..."
REALM_EXISTS=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}" | grep -c '"realm"' || true)

if [[ $REALM_EXISTS -eq 0 ]]; then
    echo "📝 Creating realm '${KEYCLOAK_REALM}'..."
    curl -s -X POST \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "realm": "'${KEYCLOAK_REALM}'",
            "displayName": "ERP System",
            "enabled": true,
            "registrationAllowed": true,
            "registrationEmailAsUsername": false,
            "rememberMe": true,
            "verifyEmail": false,
            "loginWithEmailAllowed": true,
            "duplicateEmailsAllowed": false,
            "resetPasswordAllowed": true,
            "editUsernameAllowed": false,
            "bruteForceProtected": true,
            "permanentLockout": false,
            "maxFailureWaitSeconds": 900,
            "minimumQuickLoginWaitSeconds": 60,
            "waitIncrementSeconds": 60,
            "quickLoginCheckMilliSeconds": 1000,
            "maxDeltaTimeSeconds": 43200,
            "failureFactor": 30,
            "defaultRoles": ["default-roles-'${KEYCLOAK_REALM}'", "offline_access", "uma_authorization"],
            "requiredCredentials": ["password"],
            "passwordPolicy": "length(8)",
            "otpPolicyType": "totp",
            "otpPolicyAlgorithm": "HmacSHA1",
            "otpPolicyInitialCounter": 0,
            "otpPolicyDigits": 6,
            "otpPolicyLookAheadWindow": 1,
            "otpPolicyPeriod": 30,
            "ssoSessionIdleTimeout": 1800,
            "ssoSessionMaxLifespan": 36000,
            "ssoSessionIdleTimeoutRememberMe": 0,
            "ssoSessionMaxLifespanRememberMe": 0,
            "offlineSessionIdleTimeout": 2592000,
            "offlineSessionMaxLifespanEnabled": false,
            "offlineSessionMaxLifespan": 5184000,
            "accessTokenLifespan": 300,
            "accessTokenLifespanForImplicitFlow": 900,
            "sslRequired": "external",
            "internationalizationEnabled": true,
            "supportedLocales": ["en", "de", "fr", "es", "it", "ja", "ko", "pt-BR", "ru", "zh-CN"],
            "defaultLocale": "en",
            "browserFlow": "browser",
            "registrationFlow": "registration",
            "directGrantFlow": "direct grant",
            "resetCredentialsFlow": "reset credentials",
            "clientAuthenticationFlow": "clients",
            "dockerAuthenticationFlow": "docker auth"
        }' \
        "${KEYCLOAK_URL}/admin/realms"
    
    echo "✅ Realm '${KEYCLOAK_REALM}' created"
else
    echo "✅ Realm '${KEYCLOAK_REALM}' already exists"
fi

# Check if client already exists
echo "🔍 Checking if client '${CLIENT_ID}' exists..."
CLIENT_EXISTS=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${CLIENT_ID}" | grep -c '"clientId"' || true)

if [[ $CLIENT_EXISTS -gt 0 ]]; then
    echo "⚠️  Client '${CLIENT_ID}' already exists. Updating configuration..."
    
    # Get existing client UUID
    CLIENT_UUID=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${CLIENT_ID}" | \
        grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    # Update existing client
    curl -s -X PUT \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "clientId": "'${CLIENT_ID}'",
            "name": "'${CLIENT_NAME}'",
            "description": "Frontend client for the ERP System web application",
            "enabled": true,
            "protocol": "openid-connect",
            "publicClient": true,
            "standardFlowEnabled": true,
            "implicitFlowEnabled": false,
            "directAccessGrantsEnabled": true,
            "serviceAccountsEnabled": false,
            "authorizationServicesEnabled": false,
            "redirectUris": ["'${REDIRECT_URIS}'"],
            "webOrigins": ["'${WEB_ORIGINS}'"],
            "baseUrl": "'${FRONTEND_BASE_URL}'",
            "adminUrl": "'${FRONTEND_BASE_URL}'",
            "attributes": {
                "pkce.code.challenge.method": "S256",
                "post.logout.redirect.uris": "'${FRONTEND_BASE_URL}'/logout"
            },
            "protocolMappers": [
                {
                    "name": "organization_id",
                    "protocol": "openid-connect",
                    "protocolMapper": "oidc-usermodel-attribute-mapper",
                    "consentRequired": false,
                    "config": {
                        "userinfo.token.claim": "true",
                        "user.attribute": "organization_id",
                        "id.token.claim": "true",
                        "access.token.claim": "true",
                        "claim.name": "organization_id",
                        "jsonType.label": "String"
                    }
                }
            ]
        }' \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_UUID}"
    
    echo "✅ Client '${CLIENT_ID}' updated"
else
    echo "📝 Creating client '${CLIENT_ID}'..."
    curl -s -X POST \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "clientId": "'${CLIENT_ID}'",
            "name": "'${CLIENT_NAME}'",
            "description": "Frontend client for the ERP System web application",
            "enabled": true,
            "protocol": "openid-connect",
            "publicClient": true,
            "standardFlowEnabled": true,
            "implicitFlowEnabled": false,
            "directAccessGrantsEnabled": true,
            "serviceAccountsEnabled": false,
            "authorizationServicesEnabled": false,
            "redirectUris": ["'${REDIRECT_URIS}'"],
            "webOrigins": ["'${WEB_ORIGINS}'"],
            "baseUrl": "'${FRONTEND_BASE_URL}'",
            "adminUrl": "'${FRONTEND_BASE_URL}'",
            "attributes": {
                "pkce.code.challenge.method": "S256",
                "post.logout.redirect.uris": "'${FRONTEND_BASE_URL}'/logout"
            },
            "protocolMappers": [
                {
                    "name": "organization_id",
                    "protocol": "openid-connect",
                    "protocolMapper": "oidc-usermodel-attribute-mapper",
                    "consentRequired": false,
                    "config": {
                        "userinfo.token.claim": "true",
                        "user.attribute": "organization_id",
                        "id.token.claim": "true",
                        "access.token.claim": "true",
                        "claim.name": "organization_id",
                        "jsonType.label": "String"
                    }
                }
            ]
        }' \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients"
    
    echo "✅ Client '${CLIENT_ID}' created"
fi

# Create a demo user if it doesn't exist
echo "👤 Checking for demo user..."
DEMO_USER_EXISTS=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=demo" | grep -c '"username"' || true)

if [[ $DEMO_USER_EXISTS -eq 0 ]]; then
    echo "📝 Creating demo user..."
    curl -s -X POST \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "demo",
            "email": "demo@example.com",
            "firstName": "Demo",
            "lastName": "User",
            "enabled": true,
            "emailVerified": true,
            "attributes": {
                "organization_id": ["demo-org-id"]
            },
            "credentials": [{
                "type": "password",
                "value": "demo123",
                "temporary": false
            }]
        }' \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users"
    
    echo "✅ Demo user created (username: demo, password: demo123)"
else
    echo "✅ Demo user already exists"
fi

echo ""
echo "🎉 Keycloak setup completed successfully!"
echo ""
echo "📋 Configuration Details:"
echo "   • Keycloak URL: ${KEYCLOAK_URL}"
echo "   • Realm: ${KEYCLOAK_REALM}"
echo "   • Client ID: ${CLIENT_ID}"
echo "   • Frontend URL: ${FRONTEND_BASE_URL}"
echo ""
echo "👤 Demo User Credentials:"
echo "   • Username: demo"
echo "   • Password: demo123"
echo "   • Email: demo@example.com"
echo ""
echo "🌐 Access Points:"
echo "   • Keycloak Admin: ${KEYCLOAK_URL}/admin"
echo "   • Account Management: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/account"
echo "   • Frontend App: ${FRONTEND_BASE_URL}"
echo ""
echo "💡 Next steps:"
echo "   1. Copy apps/web-app/env.example to apps/web-app/.env"
echo "   2. Start the web application:"
echo "      npm run dev --workspace=apps/web-app"
echo "   3. Visit http://localhost:3000 and login with demo/demo123"
