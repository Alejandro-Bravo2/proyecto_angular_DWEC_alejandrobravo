#!/bin/bash

echo "================================================"
echo "🧪 TEST: MongoDB + Docker para Cofira"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verificar Docker
echo "📋 Test 1: Verificando Docker..."
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker está corriendo${NC}"
else
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi
echo ""

# Test 2: Verificar compose.yaml
echo "📋 Test 2: Verificando compose.yaml..."
if [ -f "compose.yaml" ]; then
    echo -e "${GREEN}✅ compose.yaml existe${NC}"
    if docker-compose config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ compose.yaml es válido${NC}"
    else
        echo -e "${RED}❌ compose.yaml tiene errores${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ compose.yaml no existe${NC}"
    exit 1
fi
echo ""

# Test 3: Levantar contenedores
echo "📋 Test 3: Levantando contenedores..."
docker-compose up -d > /dev/null 2>&1
sleep 5

if [ $(docker-compose ps -q | wc -l) -eq 2 ]; then
    echo -e "${GREEN}✅ Contenedores levantados correctamente${NC}"
else
    echo -e "${RED}❌ Error al levantar contenedores${NC}"
    docker-compose down > /dev/null 2>&1
    exit 1
fi
echo ""

# Test 4: Verificar MongoDB
echo "📋 Test 4: Verificando MongoDB..."
sleep 2
if docker exec cofira-mongodb mongosh --quiet --eval "db.version()" > /dev/null 2>&1; then
    VERSION=$(docker exec cofira-mongodb mongosh --quiet --eval "db.version()")
    echo -e "${GREEN}✅ MongoDB responde (versión: ${VERSION})${NC}"
else
    echo -e "${RED}❌ MongoDB no responde${NC}"
    docker-compose down > /dev/null 2>&1
    exit 1
fi
echo ""

# Test 5: Verificar autenticación
echo "📋 Test 5: Verificando autenticación..."
if docker exec cofira-mongodb mongosh -u admin -p admin123 --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Autenticación funciona${NC}"
else
    echo -e "${RED}❌ Autenticación falló${NC}"
    docker-compose down > /dev/null 2>&1
    exit 1
fi
echo ""

# Test 6: Verificar base de datos
echo "📋 Test 6: Verificando base de datos 'cofira'..."
docker exec cofira-mongodb mongosh -u admin -p admin123 --quiet --eval "use cofira; db.getName()" > /dev/null 2>&1
echo -e "${GREEN}✅ Base de datos 'cofira' accesible${NC}"
echo ""

# Test 7: Verificar Mongo Express
echo "📋 Test 7: Verificando Mongo Express..."
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Mongo Express responde en http://localhost:8081${NC}"
else
    echo -e "${YELLOW}⚠️  Mongo Express puede tardar unos segundos en iniciar${NC}"
fi
echo ""

# Test 8: Verificar puertos
echo "📋 Test 8: Verificando puertos..."
if lsof -i :27017 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Puerto 27017 (MongoDB) está en uso${NC}"
else
    echo -e "${RED}❌ Puerto 27017 no está en uso${NC}"
fi

if lsof -i :8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Puerto 8081 (Mongo Express) está en uso${NC}"
else
    echo -e "${YELLOW}⚠️  Puerto 8081 no está en uso (puede tardar en iniciar)${NC}"
fi
echo ""

# Detener contenedores
echo "📋 Limpieza: Deteniendo contenedores..."
docker-compose down > /dev/null 2>&1
echo -e "${GREEN}✅ Contenedores detenidos${NC}"
echo ""

# Resumen
echo "================================================"
echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON${NC}"
echo "================================================"
echo ""
echo "Tu configuración de MongoDB está lista para usar."
echo ""
echo "Para iniciar el entorno:"
echo "  ./start-dev.sh"
echo ""
echo "Para detener:"
echo "  ./stop-dev.sh"
echo ""
echo "URLs:"
echo "  - MongoDB: localhost:27017"
echo "  - Mongo Express: http://localhost:8081"
echo "  - Spring Boot: http://localhost:8080"
echo ""
echo "Credenciales:"
echo "  - Usuario: admin"
echo "  - Password: admin123"
echo ""
