# Makefile for Grammar Fixer Docker operations

.PHONY: help build run stop clean logs test security-scan docker-compose-up docker-compose-down

# Variables
IMAGE_NAME=grammar-fixer
IMAGE_TAG=latest
CONTAINER_NAME=grammar-fixer
PORT=3000

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

run: ## Run Docker container
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		-e OLLAMA_HOST=http://host.docker.internal:11434 \
		-e OLLAMA_MODEL=gemma3 \
		$(IMAGE_NAME):$(IMAGE_TAG)

stop: ## Stop and remove Docker container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

restart: stop run ## Restart Docker container

logs: ## View container logs
	docker logs -f $(CONTAINER_NAME)

clean: stop ## Clean up Docker resources
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true

test: ## Run tests in Docker container
	docker run --rm \
		-e OLLAMA_HOST=http://host.docker.internal:11434 \
		$(IMAGE_NAME):$(IMAGE_TAG) npm test

security-scan: ## Run security scan on Docker image
	@echo "Running Trivy security scan..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image $(IMAGE_NAME):$(IMAGE_TAG)

security-scan-critical: ## Run security scan and fail on critical vulnerabilities
	@echo "Running Trivy security scan (critical vulnerabilities only)..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image --severity CRITICAL $(IMAGE_NAME):$(IMAGE_TAG)

lint-dockerfile: ## Lint Dockerfile with hadolint
	docker run --rm -i hadolint/hadolint < Dockerfile

docker-compose-up: ## Start services with docker-compose
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Services started. Check health: curl http://localhost:3000/health"

docker-compose-down: ## Stop services with docker-compose
	docker-compose down

docker-compose-logs: ## View docker-compose logs
	docker-compose logs -f

docker-compose-pull-model: ## Pull Gemma3 model in Ollama container
	docker-compose exec ollama ollama pull gemma3

docker-compose-restart: docker-compose-down docker-compose-up ## Restart docker-compose services

health-check: ## Check service health
	@curl -s http://localhost:$(PORT)/health | jq '.' || echo "Service not responding"

test-api: ## Test API endpoints
	@echo "Testing health endpoint..."
	@curl -s http://localhost:$(PORT)/health | jq '.'
	@echo "\nTesting grammar fix endpoint..."
	@curl -s -X POST http://localhost:$(PORT)/grammar/fix \
		-H "Content-Type: application/json" \
		-d '{"text": "She dont like apples"}' | jq '.'

all: build run ## Build and run Docker container

dev: docker-compose-up docker-compose-pull-model ## Start development environment

.DEFAULT_GOAL := help
