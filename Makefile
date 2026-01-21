# BiUD Development Makefile
# Commands for Clarinet, tests, and tooling

.PHONY: help install check test test-watch console clean lint format docker-build docker-run docker-stop setup env-setup info

help: ## Show this help message
	@echo "BiUD Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install JS dependencies
	npm install

check: ## Run Clarinet check
	npx clarinet check

console: ## Open Clarinet console
	npx clarinet console

test: ## Run tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

clean: ## Clean build artifacts
	rm -rf .clarinet .cache coverage node_modules/.cache

lint: ## Lint contracts and tests (placeholder)
	@echo "No lint configuration found."

format: ## Format contracts and tests (placeholder)
	@echo "No format configuration found."

docker-build: ## Build Docker image
	docker build -t biud .

docker-run: ## Run Clarinet check in Docker
	docker run --rm -v $$PWD:/app -w /app biud

docker-stop: ## No-op for local dev
	@echo "Nothing to stop."

setup: install ## Setup development environment
	@echo "Setup complete."

env-setup: ## Create .env template
	@echo "Creating .env file..."
	@echo "# BiUD environment" > .env
	@echo "STACKS_NETWORK=mocknet" >> .env
	@echo "CLARINET_DIR=.clarinet" >> .env

info: ## Show project information
	@echo "BiUD - Bitcoin Username Domain (.sBTC)"
	@echo "Framework: Clarinet"
	@echo "Tests: Vitest + clarinet-sdk"