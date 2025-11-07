# ===============================================
# Makefile - Soldent Docker Commands
# ===============================================

.PHONY: help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Soldent - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ===============================================
# Development Commands
# ===============================================

dev-up: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development environment started!$(NC)"

dev-down: ## Stop development environment
	@echo "$(BLUE)Stopping development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)Development environment stopped!$(NC)"

dev-logs: ## Show development logs
	@docker-compose -f docker-compose.dev.yml logs -f

dev-restart: ## Restart development environment
	@echo "$(BLUE)Restarting development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml restart
	@echo "$(GREEN)Development environment restarted!$(NC)"

dev-rebuild: ## Rebuild development images
	@echo "$(BLUE)Rebuilding development images...$(NC)"
	@docker-compose -f docker-compose.dev.yml build --no-cache
	@echo "$(GREEN)Images rebuilt!$(NC)"

dev-tools: ## Start with development tools (pgAdmin, Redis Commander)
	@echo "$(BLUE)Starting with development tools...$(NC)"
	@docker-compose -f docker-compose.dev.yml --profile tools up -d
	@echo "$(GREEN)Tools started!$(NC)"

# ===============================================
# Production Commands
# ===============================================

prod-up: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Production environment started!$(NC)"

prod-down: ## Stop production environment
	@echo "$(BLUE)Stopping production environment...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Production environment stopped!$(NC)"

prod-logs: ## Show production logs
	@docker-compose logs -f

prod-build: ## Build production images
	@echo "$(BLUE)Building production images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)Images built!$(NC)"

prod-rebuild: ## Rebuild production images
	@echo "$(BLUE)Rebuilding production images...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)Images rebuilt!$(NC)"

# ===============================================
# Database Commands
# ===============================================

db-migrate: ## Run Prisma migrations (development)
	@echo "$(BLUE)Running database migrations...$(NC)"
	@docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
	@echo "$(GREEN)Migrations completed!$(NC)"

db-migrate-prod: ## Run Prisma migrations (production)
	@echo "$(BLUE)Running production migrations...$(NC)"
	@docker-compose exec backend npx prisma migrate deploy
	@echo "$(GREEN)Migrations deployed!$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	@docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

db-reset: ## Reset database (development only)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset; \
	fi

db-seed: ## Seed database
	@echo "$(BLUE)Seeding database...$(NC)"
	@docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
	@echo "$(GREEN)Database seeded!$(NC)"

db-backup: ## Create database backup
	@echo "$(BLUE)Creating database backup...$(NC)"
	@bash scripts/backup-db.sh

db-restore: ## Restore database from backup
	@echo "$(BLUE)Restoring database...$(NC)"
	@bash scripts/restore-db.sh

db-shell: ## Connect to PostgreSQL shell
	@docker-compose -f docker-compose.dev.yml exec postgres psql -U soldent_dev -d soldent_dev

# ===============================================
# Service Commands
# ===============================================

backend-shell: ## Open backend container shell
	@docker-compose -f docker-compose.dev.yml exec backend sh

frontend-shell: ## Open frontend container shell
	@docker-compose -f docker-compose.dev.yml exec frontend sh

backend-logs: ## Show backend logs
	@docker-compose -f docker-compose.dev.yml logs -f backend

frontend-logs: ## Show frontend logs
	@docker-compose -f docker-compose.dev.yml logs -f frontend

redis-cli: ## Connect to Redis CLI
	@docker-compose -f docker-compose.dev.yml exec redis redis-cli

redis-flush: ## Flush all Redis data
	@echo "$(RED)WARNING: This will delete all Redis data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.dev.yml exec redis redis-cli FLUSHALL; \
		echo "$(GREEN)Redis flushed!$(NC)"; \
	fi

# ===============================================
# Utility Commands
# ===============================================

ps: ## Show running containers
	@docker-compose -f docker-compose.dev.yml ps

status: ## Show services status
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "$(BLUE)Service URLs:$(NC)"
	@echo "  Frontend:        http://localhost:3000"
	@echo "  Backend:         http://localhost:3001"
	@echo "  Backend API:     http://localhost:3001/api"
	@echo "  pgAdmin:         http://localhost:5050"
	@echo "  Redis Commander: http://localhost:8081"

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)WARNING: This will remove all data and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.dev.yml down -v --rmi all; \
		docker-compose down -v --rmi all; \
		echo "$(GREEN)Cleaned!$(NC)"; \
	fi

prune: ## Prune Docker system
	@echo "$(BLUE)Pruning Docker system...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)System pruned!$(NC)"

prune-all: ## Prune Docker system including volumes
	@echo "$(RED)WARNING: This will remove all unused containers, networks, images, and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -a --volumes -f; \
		echo "$(GREEN)System pruned!$(NC)"; \
	fi

# ===============================================
# Setup Commands
# ===============================================

setup: ## Initial setup (create .env files)
	@echo "$(BLUE)Setting up environment...$(NC)"
	@test -f .env || cp .env.example .env
	@test -f ../backend/.env || cp ../backend/.env.example ../backend/.env
	@test -f ../frontend/.env.local || cp ../frontend/.env.example ../frontend/.env.local
	@echo "$(GREEN)Environment files created!$(NC)"
	@echo "$(YELLOW)Please update the .env files with your configuration$(NC)"

install: setup ## Install and start development environment
	@echo "$(BLUE)Installing development environment...$(NC)"
	@$(MAKE) dev-up
	@echo "$(YELLOW)Waiting for services to be ready...$(NC)"
	@sleep 10
	@echo "$(BLUE)Running database migrations...$(NC)"
	@$(MAKE) db-migrate
	@echo "$(GREEN)Installation complete!$(NC)"
	@$(MAKE) status

# ===============================================
# Testing Commands
# ===============================================

test: ## Run backend tests
	@docker-compose -f docker-compose.dev.yml exec backend npm test

test-watch: ## Run backend tests in watch mode
	@docker-compose -f docker-compose.dev.yml exec backend npm run test:watch

test-cov: ## Run backend tests with coverage
	@docker-compose -f docker-compose.dev.yml exec backend npm run test:cov

# ===============================================
# Default
# ===============================================

.DEFAULT_GOAL := help
