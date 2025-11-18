#!/bin/bash

# ==============================================
# SecurePass - Script de Detención
# ==============================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⏹️  Deteniendo SecurePass...${NC}"
echo ""

docker-compose down

echo ""
echo -e "${GREEN}✓ SecurePass detenido exitosamente${NC}"
echo ""
echo "Para reiniciar: ./start.sh o make start"
echo ""
