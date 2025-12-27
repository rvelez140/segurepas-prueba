.PHONY: help build build-prod build-push build-no-cache clean images

# Variables
SCRIPT_DIR := scripts

help:
	@echo "========================================="
	@echo "SecurePass - Comandos de Docker"
	@echo "========================================="
	@echo ""
	@echo "Construcción de imágenes:"
	@echo "  make build          - Construir imágenes locales"
	@echo "  make build-prod     - Construir imágenes para producción"
	@echo "  make build-push     - Construir y subir imágenes a registro"
	@echo "  make build-no-cache - Construir sin usar caché"
	@echo ""
	@echo "Docker Compose:"
	@echo "  make up             - Iniciar servicios (local)"
	@echo "  make up-prod        - Iniciar servicios (producción)"
	@echo "  make down           - Detener servicios"
	@echo "  make logs           - Ver logs de servicios"
	@echo "  make ps             - Ver estado de servicios"
	@echo ""
	@echo "Utilidades:"
	@echo "  make images         - Listar imágenes Docker"
	@echo "  make clean          - Limpiar imágenes no utilizadas"
	@echo "  make clean-all      - Limpiar todo (imágenes, contenedores, volúmenes)"
	@echo ""

# ========================================
# Construcción de imágenes
# ========================================

build:
	@echo "Construyendo imágenes locales..."
	@$(SCRIPT_DIR)/build-images.sh --local

build-prod:
	@echo "Construyendo imágenes para producción..."
	@$(SCRIPT_DIR)/build-images.sh --production

build-push:
	@echo "Construyendo y subiendo imágenes..."
	@$(SCRIPT_DIR)/build-images.sh --production --push

build-no-cache:
	@echo "Construyendo imágenes sin caché..."
	@$(SCRIPT_DIR)/build-images.sh --no-cache

build-tag:
	@if [ -z "$(TAG)" ]; then \
		echo "Error: Especifica un tag con TAG=v1.0.0"; \
		exit 1; \
	fi
	@echo "Construyendo imágenes con tag $(TAG)..."
	@$(SCRIPT_DIR)/build-images.sh --production --tag $(TAG)

# ========================================
# Docker Compose
# ========================================

up:
	@echo "Iniciando servicios (modo local)..."
	docker-compose -f docker-compose.local.yml up -d

up-prod:
	@echo "Iniciando servicios (modo producción)..."
	docker-compose -f docker-compose.production.yml up -d

down:
	@echo "Deteniendo servicios..."
	@if [ -f docker-compose.local.yml ]; then \
		docker-compose -f docker-compose.local.yml down; \
	fi
	@if [ -f docker-compose.production.yml ]; then \
		docker-compose -f docker-compose.production.yml down; \
	fi

down-volumes:
	@echo "Deteniendo servicios y eliminando volúmenes..."
	@if [ -f docker-compose.local.yml ]; then \
		docker-compose -f docker-compose.local.yml down -v; \
	fi
	@if [ -f docker-compose.production.yml ]; then \
		docker-compose -f docker-compose.production.yml down -v; \
	fi

restart:
	@make down
	@make up

restart-prod:
	@make down
	@make up-prod

logs:
	docker-compose -f docker-compose.local.yml logs -f

logs-prod:
	docker-compose -f docker-compose.production.yml logs -f

ps:
	@echo "Servicios locales:"
	@docker-compose -f docker-compose.local.yml ps || true
	@echo ""
	@echo "Servicios producción:"
	@docker-compose -f docker-compose.production.yml ps || true

# ========================================
# Utilidades
# ========================================

images:
	@echo "Imágenes de SecurePass:"
	@docker images | grep -E "(securepass|REPOSITORY)" || echo "No hay imágenes de SecurePass"

clean:
	@echo "Limpiando imágenes no utilizadas..."
	docker image prune -f

clean-all:
	@echo "⚠️  Esto eliminará todas las imágenes, contenedores y volúmenes no utilizados"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -a --volumes -f; \
		echo "✓ Sistema Docker limpiado"; \
	else \
		echo "Operación cancelada"; \
	fi

shell-api:
	docker exec -it securepass-api sh

shell-web:
	docker exec -it securepass-web sh

shell-mongodb:
	docker exec -it securepass-mongodb mongosh

# ========================================
# Desarrollo rápido
# ========================================

dev: build up logs

prod: build-prod up-prod logs-prod

rebuild:
	@make down
	@make build-no-cache
	@make up

rebuild-prod:
	@make down
	@make build-no-cache build-prod
	@make up-prod
