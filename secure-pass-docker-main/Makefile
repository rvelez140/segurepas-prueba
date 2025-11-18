# ==============================================
# SecurePass - Makefile
# Comandos simplificados para Docker
# ==============================================

.DEFAULT_GOAL := help
.PHONY: help start stop restart logs build clean migrate backup restore status shell-api shell-web shell-db dev prod up down

# Colores
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
BLUE   := $(shell tput -Txterm setaf 4)
RESET  := $(shell tput -Txterm sgr0)

## —— SecurePass Makefile ————————————————————————————————————
help: ## Mostrar esta ayuda
	@echo '${BLUE}SecurePass - Comandos Disponibles${RESET}'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${RESET} %s\n", $$1, $$2}'
	@echo ''

## —— Docker ——————————————————————————————————————————————————
start: ## Iniciar todos los servicios
	@echo '${BLUE}🚀 Iniciando SecurePass...${RESET}'
	@chmod +x start.sh
	@./start.sh

stop: ## Detener todos los servicios
	@echo '${BLUE}⏹️  Deteniendo SecurePass...${RESET}'
	@docker-compose down
	@echo '${GREEN}✓ Servicios detenidos${RESET}'

restart: ## Reiniciar todos los servicios
	@echo '${BLUE}🔄 Reiniciando SecurePass...${RESET}'
	@docker-compose restart
	@echo '${GREEN}✓ Servicios reiniciados${RESET}'

## —— Logs ————————————————————————————————————————————————————
logs: ## Ver logs de todos los servicios
	@docker-compose logs -f

logs-api: ## Ver logs solo del API
	@docker-compose logs -f api

logs-web: ## Ver logs solo del frontend
	@docker-compose logs -f web

logs-db: ## Ver logs solo de MongoDB
	@docker-compose logs -f mongodb

## —— Build ———————————————————————————————————————————————————
build: ## Reconstruir todas las imágenes
	@echo '${BLUE}🔨 Construyendo imágenes...${RESET}'
	@docker-compose build
	@echo '${GREEN}✓ Imágenes construidas${RESET}'

build-nocache: ## Reconstruir sin caché
	@echo '${BLUE}🔨 Construyendo imágenes (sin caché)...${RESET}'
	@docker-compose build --no-cache
	@echo '${GREEN}✓ Imágenes construidas${RESET}'

rebuild: ## Reconstruir e iniciar
	@make build
	@make start

## —— Desarrollo ——————————————————————————————————————————————
dev: ## Iniciar en modo desarrollo
	@export NODE_ENV=development BUILD_TARGET=development && docker-compose up

prod: ## Iniciar en modo producción
	@export NODE_ENV=production BUILD_TARGET=production && docker-compose up -d

## —— Base de Datos ———————————————————————————————————————————
migrate: ## Ejecutar migración multi-tenant
	@echo '${BLUE}🔄 Ejecutando migración...${RESET}'
	@docker-compose exec api npm run migrate
	@echo '${GREEN}✓ Migración completada${RESET}'

backup: ## Backup de MongoDB
	@echo '${BLUE}💾 Creando backup...${RESET}'
	@mkdir -p backups
	@docker-compose exec mongodb mongodump --out=/data/backup-$(shell date +%Y%m%d-%H%M%S)
	@echo '${GREEN}✓ Backup creado${RESET}'

restore: ## Restaurar último backup (requiere BACKUP_DATE)
	@echo '${BLUE}📥 Restaurando backup...${RESET}'
ifndef BACKUP_DATE
	@echo '${YELLOW}⚠ Uso: make restore BACKUP_DATE=20240101-120000${RESET}'
else
	@docker-compose exec mongodb mongorestore /data/backup-$(BACKUP_DATE)
	@echo '${GREEN}✓ Backup restaurado${RESET}'
endif

## —— Shell ———————————————————————————————————————————————————
shell-api: ## Abrir shell en contenedor API
	@docker-compose exec api sh

shell-web: ## Abrir shell en contenedor Web
	@docker-compose exec web sh

shell-db: ## Abrir shell MongoDB
	@docker-compose exec mongodb mongosh

## —— Estado ——————————————————————————————————————————————————
status: ## Ver estado de servicios
	@echo '${BLUE}📊 Estado de servicios:${RESET}'
	@docker-compose ps

ps: status ## Alias para status

health: ## Ver health de servicios
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

## —— Limpieza ————————————————————————————————————————————————
clean: ## Limpiar contenedores y volúmenes (¡CUIDADO!)
	@echo '${YELLOW}⚠️  ADVERTENCIA: Esto borrará todos los datos${RESET}'
	@read -p "¿Estás seguro? (escribir 'yes'): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@docker-compose down -v
	@echo '${GREEN}✓ Limpieza completada${RESET}'

prune: ## Limpiar imágenes no usadas
	@echo '${BLUE}🧹 Limpiando imágenes...${RESET}'
	@docker image prune -f
	@echo '${GREEN}✓ Imágenes limpiadas${RESET}'

## —— Testing —————————————————————————————————————————————————
test: ## Ejecutar tests del API
	@docker-compose exec api npm test

test-watch: ## Ejecutar tests en modo watch
	@docker-compose exec api npm run test:watch

## —— Instalación ————————————————————————————————————————————
install: ## Primera instalación completa
	@echo '${BLUE}📦 Instalando SecurePass...${RESET}'
	@[ -f .env ] || cp .env.example .env
	@chmod +x start.sh stop.sh help.sh
	@docker-compose build
	@echo ''
	@echo '${GREEN}✓ Instalación completada${RESET}'
	@echo ''
	@echo '${YELLOW}⚠️  No olvides configurar .env con tus credenciales${RESET}'
	@echo ''
	@echo '${BLUE}Próximo paso: make start${RESET}'
	@echo ''

## —— Monitoreo ——————————————————————————————————————————————
stats: ## Ver uso de recursos
	@docker stats --no-stream

top: ## Ver procesos en contenedores
	@docker-compose top

## —— Atajos ——————————————————————————————————————————————————
up: start ## Alias para start
down: stop ## Alias para stop

## —— Información ————————————————————————————————————————————
info: ## Mostrar información del sistema
	@echo '${BLUE}ℹ️  Información del sistema${RESET}'
	@echo ''
	@echo 'Docker:'
	@docker --version
	@echo ''
	@echo 'Docker Compose:'
	@docker-compose --version
	@echo ''
	@echo 'Servicios corriendo:'
	@docker-compose ps
	@echo ''
	@echo 'Uso de disco:'
	@docker system df
	@echo ''

version: ## Ver versión de SecurePass
	@echo '${GREEN}SecurePass v1.0.0${RESET}'
	@echo 'Multi-Tenant Access Control System'
