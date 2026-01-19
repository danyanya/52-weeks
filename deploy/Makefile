# Paths (all commands should be run from project root)
COMPOSE_FILE = deploy/docker-compose.yml
COMPOSE_FILE_PROD = deploy/docker-compose.prod.yml

.PHONY: help build up down restart logs clean

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образ
	docker-compose -f $(COMPOSE_FILE) build

up: ## Запустить контейнеры
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Остановить и удалить контейнеры
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Перезапустить контейнеры
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## Показать логи
	docker-compose -f $(COMPOSE_FILE) logs -f

clean: ## Удалить контейнеры и образы
	docker-compose -f $(COMPOSE_FILE) down -v
	docker rmi 52-weeks-web 2>/dev/null || true

status: ## Показать статус контейнеров
	docker-compose -f $(COMPOSE_FILE) ps

rebuild: ## Пересобрать без кэша
	docker-compose -f $(COMPOSE_FILE) build --no-cache

deploy: ## Полное развертывание (build + up)
	docker-compose -f $(COMPOSE_FILE) build && docker-compose -f $(COMPOSE_FILE) up -d

update: ## Обновить приложение
	git pull origin main && docker-compose -f $(COMPOSE_FILE) build && docker-compose -f $(COMPOSE_FILE) up -d

health: ## Проверить health status
	curl -f http://localhost/health || exit 1

# Production deployment with SSL
prod-up: ## Запустить production с SSL
	docker-compose -f $(COMPOSE_FILE_PROD) up -d

prod-down: ## Остановить production
	docker-compose -f $(COMPOSE_FILE_PROD) down

prod-logs: ## Логи production
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f

prod-deploy: ## Полное production развертывание
	docker-compose -f $(COMPOSE_FILE_PROD) build && docker-compose -f $(COMPOSE_FILE_PROD) up -d
