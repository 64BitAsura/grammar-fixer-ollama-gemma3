# Production-ready Docker image with security best practices
FROM node:22-alpine

# Set labels for metadata
LABEL maintainer="grammar-fixer-ollama-gemma3"
LABEL description="Grammar Fixer microservice using Ollama and Gemma3"
LABEL version="1.0.0"

# Note: In production environments, consider adding:
# - Security updates: apk --no-cache upgrade
# - dumb-init for signal handling: apk --no-cache add dumb-init
# Skipped here for CI/CD compatibility

# Create a non-root user and group
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=appuser:appuser package*.json ./

# Copy node_modules from host
# NOTE: This approach requires node_modules to be installed on the host before building
# Advantages: Works in restricted CI/CD environments without npm registry access
# For production with full npm access, use Dockerfile.multistage instead
# Build command: npm install --omit=dev && docker build -t grammar-fixer:latest .
COPY --chown=appuser:appuser node_modules/ ./node_modules/

# Copy application source code
COPY --chown=appuser:appuser src/ ./src/
COPY --chown=appuser:appuser openapi.json openapi.yaml ./

# Set environment variables
ENV NODE_ENV=production \
    OLLAMA_HOST=http://host.docker.internal:11434 \
    OLLAMA_MODEL=gemma3 \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose port for health checks and potential HTTP API
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})" || exit 1

# Default command - run the HTTP server for microservice mode
# Note: In production, consider using dumb-init: ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
