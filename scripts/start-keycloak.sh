#!/bin/bash

echo "🚀 Starting Keycloak for education-server..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Start Keycloak
echo "📦 Starting containers..."
docker compose -f docker-compose.keycloak.yml up -d

# Wait for Keycloak to start
echo "⏳ Waiting for Keycloak to start (this may take 1-2 minutes)..."
sleep 30

# Check status
if curl -f http://localhost:8080/health/ready > /dev/null 2>&1; then
    echo "✅ Keycloak started successfully!"
    echo ""
    echo "🌐 Keycloak Admin Console: http://localhost:8080"
    echo "👤 Username: admin"
    echo "🔑 Password: admin"
    echo ""
    echo "📋 Next step: open browser and go to the link above"
else
    echo "⚠️  Keycloak is still starting. Check status with command:"
    echo "   docker compose -f docker-compose.keycloak.yml logs -f keycloak"
fi 