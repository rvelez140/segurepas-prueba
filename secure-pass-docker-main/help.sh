#!/bin/bash

# ==============================================
# SecurePass - Ayuda Rápida
# ==============================================

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

cat << EOF
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${CYAN}   SecurePass - Guía Rápida de Comandos${NC}
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}INICIO RÁPIDO:${NC}
  ${YELLOW}./start.sh${NC}                    Iniciar SecurePass
  ${YELLOW}make start${NC}                    Iniciar con Make
  ${YELLOW}make install${NC}                  Primera instalación

${GREEN}CONTROL DE SERVICIOS:${NC}
  ${YELLOW}make stop${NC}                     Detener todos los servicios
  ${YELLOW}make restart${NC}                  Reiniciar servicios
  ${YELLOW}make status${NC}                   Ver estado de servicios
  ${YELLOW}make logs${NC}                     Ver logs en tiempo real

${GREEN}DESARROLLO:${NC}
  ${YELLOW}make dev${NC}                      Modo desarrollo (hot-reload)
  ${YELLOW}make prod${NC}                     Modo producción
  ${YELLOW}make build${NC}                    Reconstruir imágenes
  ${YELLOW}make test${NC}                     Ejecutar tests

${GREEN}LOGS:${NC}
  ${YELLOW}make logs${NC}                     Todos los logs
  ${YELLOW}make logs-api${NC}                 Solo API
  ${YELLOW}make logs-web${NC}                 Solo Frontend
  ${YELLOW}make logs-db${NC}                  Solo MongoDB

${GREEN}BASE DE DATOS:${NC}
  ${YELLOW}make migrate${NC}                  Ejecutar migración multi-tenant
  ${YELLOW}make backup${NC}                   Crear backup de MongoDB
  ${YELLOW}make shell-db${NC}                 Abrir shell de MongoDB

${GREEN}SHELL DE CONTENEDORES:${NC}
  ${YELLOW}make shell-api${NC}                Abrir shell en API
  ${YELLOW}make shell-web${NC}                Abrir shell en Web
  ${YELLOW}make shell-db${NC}                 Abrir MongoDB shell

${GREEN}MONITOREO:${NC}
  ${YELLOW}make stats${NC}                    Ver uso de recursos
  ${YELLOW}make health${NC}                   Ver salud de servicios
  ${YELLOW}make top${NC}                      Ver procesos

${GREEN}LIMPIEZA:${NC}
  ${YELLOW}make clean${NC}                    Limpiar TODO (¡cuidado!)
  ${YELLOW}make prune${NC}                    Limpiar imágenes no usadas

${GREEN}INFORMACIÓN:${NC}
  ${YELLOW}make info${NC}                     Información del sistema
  ${YELLOW}make help${NC}                     Ver todos los comandos
  ${YELLOW}make version${NC}                  Ver versión

${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}URLs DE ACCESO:${NC}
  Frontend:    ${CYAN}http://localhost:3000${NC}
  API:         ${CYAN}http://localhost:8000${NC}
  MongoDB:     ${CYAN}localhost:27017${NC}

${GREEN}DOCUMENTACIÓN:${NC}
  Quick Start: ${CYAN}README-QUICKSTART.md${NC}
  Completa:    ${CYAN}README-MULTITENANT.md${NC}
  Original:    ${CYAN}README.md${NC}

${GREEN}SOPORTE:${NC}
  GitHub:      ${CYAN}https://github.com/tu-usuario/securepass${NC}
  Issues:      ${CYAN}https://github.com/tu-usuario/securepass/issues${NC}

${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${YELLOW}TIP:${NC} Para ver la lista completa de comandos: ${CYAN}make help${NC}

EOF
