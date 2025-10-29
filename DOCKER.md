# Docker Deployment Guide

This guide explains how to deploy the Grammar Fixer application as a containerized microservice with security best practices.

## Table of Contents

- [Quick Start](#quick-start)
- [Docker Image](#docker-image)
- [Docker Compose](#docker-compose)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)

## Quick Start

### Using Docker Compose (Recommended)

The easiest way to run the application with all dependencies:

```bash
# Start all services (Ollama + Grammar Fixer)
docker-compose up -d

# Wait for Ollama to pull the model (first time only)
# This may take several minutes
docker-compose logs -f ollama

# Pull the Gemma3 model in the Ollama container
docker-compose exec ollama ollama pull gemma3

# Check service health
curl http://localhost:3000/health

# Test the grammar fix endpoint
curl -X POST http://localhost:3000/grammar/fix \
  -H "Content-Type: application/json" \
  -d '{"text": "She dont like apples"}'

# Stop all services
docker-compose down
```

### Using Docker Only

If you already have Ollama running locally:

```bash
# Build the image
docker build -t grammar-fixer:latest .

# Run the container
docker run -d \
  --name grammar-fixer \
  -p 3000:3000 \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  -e OLLAMA_MODEL=gemma3 \
  grammar-fixer:latest

# Check logs
docker logs -f grammar-fixer

# Test the service
curl http://localhost:3000/health
```

## Docker Image

### Build the Image

```bash
# Build with default tag
docker build -t grammar-fixer:latest .

# Build with specific tag
docker build -t grammar-fixer:1.0.0 .

# Build with custom build args (if needed)
docker build --no-cache -t grammar-fixer:latest .
```

### Image Features

- **Base Image**: Node.js 22 Alpine Linux (minimal size)
- **Multi-stage Build**: Optimized for production
- **Size**: ~150-200 MB (compressed)
- **Non-root User**: Runs as `appuser` (UID 1001)
- **Security**: Includes latest Alpine security updates
- **Signal Handling**: Uses `dumb-init` for proper process management

### Image Layers

1. **Builder Stage**: Installs production dependencies
2. **Runtime Stage**: Copies artifacts and runs as non-root user

## Docker Compose

### Services

The `docker-compose.yml` defines two services:

1. **ollama**: Runs the Ollama LLM backend
2. **grammar-fixer**: Runs the Grammar Fixer application

### Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f grammar-fixer

# Restart a service
docker-compose restart grammar-fixer

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Pull updated images
docker-compose pull
```

### First-time Setup

After starting the services for the first time:

```bash
# Wait for Ollama to be ready
docker-compose logs -f ollama

# Pull the model (in separate terminal)
docker-compose exec ollama ollama pull gemma3

# Verify model is loaded
docker-compose exec ollama ollama list
```

## Security Features

The Docker implementation includes multiple security best practices:

### 1. **Non-root User**
- Application runs as `appuser` (UID 1001, GID 1001)
- Prevents privilege escalation attacks
- Follows principle of least privilege

### 2. **Minimal Base Image**
- Uses Alpine Linux for smaller attack surface
- Regular security updates applied during build
- Only essential packages included

### 3. **Multi-stage Build**
- Separates build and runtime environments
- Reduces final image size
- Excludes build tools from production image

### 4. **No New Privileges**
```yaml
security_opt:
  - no-new-privileges:true
```
Prevents container processes from gaining additional privileges

### 5. **Resource Limits**
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```
Prevents resource exhaustion attacks

### 6. **Health Checks**
- Regular health monitoring
- Automatic restart on failure
- Proper signal handling with `dumb-init`

### 7. **Network Isolation**
- Uses dedicated Docker network
- Services communicate only through defined ports
- No host network mode

### 8. **Secure Headers**
The application includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

### 9. **.dockerignore**
- Excludes sensitive files (.env, .git)
- Reduces image size
- Prevents accidental secret leakage

### 10. **Read-only Filesystem** (optional)
Can be enabled for additional security:
```yaml
read_only: true
tmpfs:
  - /tmp
```

## API Endpoints

The microservice exposes the following HTTP endpoints:

### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "grammar-fixer-ollama-gemma3",
  "version": "1.0.0"
}
```

### POST /grammar/fix

Analyzes text and returns grammar corrections.

**Request:**
```json
{
  "text": "She dont like apples",
  "options": {
    "model": "gemma3",
    "host": "http://ollama:11434"
  }
}
```

**Response:**
```json
{
  "corrections": [
    {
      "location": { "start": 4, "end": 8 },
      "oldText": "dont",
      "newText": "doesn't",
      "explanation": "Incorrect contraction"
    }
  ],
  "count": 1
}
```

### POST /grammar/apply

Applies corrections to the original text.

**Request:**
```json
{
  "text": "She dont like apples",
  "corrections": [
    {
      "location": { "start": 4, "end": 8 },
      "oldText": "dont",
      "newText": "doesn't"
    }
  ]
}
```

**Response:**
```json
{
  "originalText": "She dont like apples",
  "correctedText": "She doesn't like apples",
  "corrections": [...]
}
```

### GET /

Returns service information and available endpoints.

## Environment Variables

### Grammar Fixer Service

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | HTTP server host |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma3` | Ollama model to use |
| `NODE_ENV` | `production` | Node.js environment |

### Example with Custom Variables

```bash
docker run -d \
  -p 3000:3000 \
  -e OLLAMA_HOST=http://ollama-server:11434 \
  -e OLLAMA_MODEL=gemma:2b \
  -e PORT=8080 \
  grammar-fixer:latest
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml grammar-fixer

# List services
docker service ls

# Scale the service
docker service scale grammar-fixer_grammar-fixer=3

# Remove stack
docker stack rm grammar-fixer
```

### Kubernetes

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grammar-fixer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: grammar-fixer
  template:
    metadata:
      labels:
        app: grammar-fixer
    spec:
      containers:
      - name: grammar-fixer
        image: grammar-fixer:latest
        ports:
        - containerPort: 3000
        env:
        - name: OLLAMA_HOST
          value: "http://ollama-service:11434"
        - name: OLLAMA_MODEL
          value: "gemma3"
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
---
apiVersion: v1
kind: Service
metadata:
  name: grammar-fixer-service
spec:
  selector:
    app: grammar-fixer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Registry Push

```bash
# Tag for your registry
docker tag grammar-fixer:latest your-registry.com/grammar-fixer:1.0.0

# Push to registry
docker push your-registry.com/grammar-fixer:1.0.0
```

### CI/CD Integration

This project includes automated Docker Hub publishing via GitHub Actions.

#### Automated Publishing to Docker Hub

The `.github/workflows/docker.yml` workflow automatically publishes Docker images to Docker Hub when changes are pushed to the `main` or `master` branch. The workflow:

1. Builds and scans the Docker image for vulnerabilities
2. Runs security and functional tests
3. Publishes the image to Docker Hub (only on push to main/master)

#### Setting Up Docker Hub Secrets

To enable automated publishing, configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - **Name**: `DOCKERHUB_USERNAME`
     - **Value**: Your Docker Hub username
   - **Name**: `DOCKERHUB_TOKEN`
     - **Value**: Your Docker Hub access token (not your password!)

**Creating a Docker Hub Access Token:**

1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a descriptive name (e.g., "GitHub Actions")
5. Copy the token (you won't be able to see it again!)
6. Use this token as the `DOCKERHUB_TOKEN` secret value

#### Image Tags

The CI/CD pipeline automatically tags images with:
- `latest` - Latest stable version (only on default branch)
- `<branch>-<sha>` - Branch name with commit SHA (e.g., `main-abc123`)
- `<branch>` - Branch name (e.g., `main`)

Example published images:
- `username/grammar-fixer-ollama-gemma3:latest`
- `username/grammar-fixer-ollama-gemma3:main`
- `username/grammar-fixer-ollama-gemma3:main-abc123`

#### Manual Publishing

You can also manually push to Docker Hub:

```bash
# Tag for Docker Hub
docker tag grammar-fixer:latest your-username/grammar-fixer-ollama-gemma3:latest

# Log in to Docker Hub
docker login

# Push to Docker Hub
docker push your-username/grammar-fixer-ollama-gemma3:latest
```

#### Example GitHub Actions workflow (for reference)

```yaml
# Automated in .github/workflows/docker.yml
- name: Build Docker image
  run: docker build -t grammar-fixer:${{ github.sha }} .

- name: Run security scan
  run: |
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
      aquasec/trivy image grammar-fixer:${{ github.sha }}

- name: Push to registry
  run: |
    echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin
    docker push your-username/grammar-fixer-ollama-gemma3:${{ github.sha }}
```

## Monitoring and Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f grammar-fixer

# Last 100 lines
docker-compose logs --tail=100 grammar-fixer

# With timestamps
docker-compose logs -f -t grammar-fixer
```

### Health Monitoring

```bash
# Check health status
docker inspect grammar-fixer | jq '.[0].State.Health'

# Continuous monitoring
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

### Metrics

For production, consider integrating:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for log aggregation
- **Jaeger** for distributed tracing

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs grammar-fixer

# Check if port is already in use
sudo lsof -i :3000

# Verify environment variables
docker-compose config
```

### Cannot Connect to Ollama

```bash
# Check if Ollama is running
docker-compose ps

# Test Ollama endpoint
docker-compose exec grammar-fixer curl http://ollama:11434/api/tags

# Restart Ollama
docker-compose restart ollama
```

### Model Not Found

```bash
# Pull model in Ollama container
docker-compose exec ollama ollama pull gemma3

# List available models
docker-compose exec ollama ollama list
```

### Permission Denied Errors

```bash
# Check file ownership
docker-compose exec grammar-fixer ls -la /app

# Verify non-root user
docker-compose exec grammar-fixer whoami
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Update resource limits in docker-compose.yml
# Then recreate containers
docker-compose up -d --force-recreate
```

## Security Scanning

### Scan for Vulnerabilities

```bash
# Using Trivy (recommended)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image grammar-fixer:latest

# Using Snyk
snyk container test grammar-fixer:latest

# Using Docker Scout
docker scout cves grammar-fixer:latest
```

### Best Practices Verification

```bash
# Using Dockle
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  goodwithtech/dockle grammar-fixer:latest

# Using Hadolint (Dockerfile linter)
docker run --rm -i hadolint/hadolint < Dockerfile
```

## Maintenance

### Update Base Image

```bash
# Pull latest base image
docker pull node:22-alpine

# Rebuild with no cache
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Prune Unused Resources

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [OpenAPI specification](openapi.yaml)
- Check container logs: `docker-compose logs -f`
