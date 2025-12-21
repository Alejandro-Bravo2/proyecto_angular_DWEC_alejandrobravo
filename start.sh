#!/bin/bash

# ============================================================================
# COFIRA - Quick Start Script
# ============================================================================
# Este script facilita el inicio de todos los servicios de COFIRA
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   COFIRA - Quick Start                     ║"
echo "║          Sistema de Gestión de Gimnasios                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que Docker está corriendo
echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    echo -e "${YELLOW}Por favor, inicia Docker Desktop y vuelve a ejecutar este script${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No se encontró el archivo .env, copiando desde .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
    else
        echo -e "${RED}❌ Error: No se encontró .env.example${NC}"
        exit 1
    fi
fi

# Preguntar al usuario si quiere ver los logs o ejecutar en segundo plano
echo ""
echo -e "${YELLOW}¿Cómo quieres iniciar los servicios?${NC}"
echo "1) Ver logs en tiempo real (recomendado para desarrollo)"
echo "2) Ejecutar en segundo plano (detached mode)"
echo ""
read -p "Selecciona una opción (1/2): " option

case $option in
    1)
        echo -e "${BLUE}🚀 Iniciando servicios con logs en tiempo real...${NC}"
        echo -e "${YELLOW}Presiona Ctrl+C para detener los servicios${NC}"
        echo ""
        docker compose up --build
        ;;
    2)
        echo -e "${BLUE}🚀 Iniciando servicios en segundo plano...${NC}"
        docker compose up --build -d

        echo ""
        echo -e "${GREEN}✅ Servicios iniciados correctamente${NC}"
        echo ""
        echo -e "${BLUE}📋 Estado de los servicios:${NC}"
        docker compose ps

        echo ""
        echo -e "${GREEN}🌐 URLs de acceso:${NC}"
        echo -e "  Frontend:  ${BLUE}http://localhost:4200${NC}"
        echo -e "  Backend:   ${BLUE}http://localhost:8080${NC}"
        echo -e "  Swagger:   ${BLUE}http://localhost:8080/swagger-ui.html${NC}"
        echo -e "  PgAdmin:   ${BLUE}http://localhost:5050${NC}"
        echo ""
        echo -e "${YELLOW}💡 Comandos útiles:${NC}"
        echo -e "  Ver logs:        ${BLUE}docker-compose logs -f${NC}"
        echo -e "  Detener:         ${BLUE}docker-compose stop${NC}"
        echo -e "  Detener y limpiar: ${BLUE}docker-compose down${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac
