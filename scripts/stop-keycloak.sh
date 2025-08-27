#!/bin/bash

echo "🛑 Stopping Keycloak..."

# Stop and remove containers
docker compose -f docker-compose.keycloak.yml down

echo "✅ Keycloak stopped!"
echo ""
echo "💡 Data is saved in Docker volume 'keycloak_postgres_data'"
echo "💡 For complete removal (including data) use:"
echo "   docker compose -f docker-compose.keycloak.yml down -v" 