#!/bin/bash

# ============================================================================
# COFIRA - Stop Script
# ============================================================================
# Este script detiene los servicios de COFIRA
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
echo "║                   COFIRA - Stop Services                   ║"
echo "║          Sistema de Gestión de Gimnasios                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Preguntar al usuario qué quiere hacer
echo -e "${YELLOW}¿Qué deseas hacer?${NC}"
echo "1) Detener servicios (mantener datos)"
echo "2) Detener y eliminar contenedores (mantener datos)"
echo "3) Detener y eliminar TODO (⚠️  incluye base de datos)"
echo ""
read -p "Selecciona una opción (1/2/3): " option

case $option in
    1)
        echo -e "${BLUE}⏸️  Deteniendo servicios...${NC}"
        docker-compose stop
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        echo -e "${YELLOW}💡 Para reiniciar: ${BLUE}docker-compose start${NC}"
        ;;
    2)
        echo -e "${BLUE}🛑 Deteniendo y eliminando contenedores...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ Contenedores eliminados${NC}"
        echo -e "${YELLOW}💡 Los datos de la base de datos se han conservado${NC}"
        ;;
    3)
        echo -e "${RED}⚠️  ¡ADVERTENCIA! Esto eliminará TODOS los datos de la base de datos${NC}"
        read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirm
        if [ "$confirm" = "SI" ]; then
            echo -e "${BLUE}🗑️  Deteniendo y eliminando TODO...${NC}"
            docker-compose down -v --rmi local
            echo -e "${GREEN}✅ Todo eliminado${NC}"
        else
            echo -e "${YELLOW}❌ Operación cancelada${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac
