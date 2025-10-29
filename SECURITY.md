# Security Policy

## Docker Security Best Practices

This project implements comprehensive security best practices for containerized deployment.

### Security Features Implemented

#### 1. Non-Root User Execution
- **Implementation**: Container runs as user `appuser` (UID: 1001, GID: 1001)
- **Benefit**: Prevents privilege escalation attacks
- **Verification**: 
  ```bash
  docker run --rm grammar-fixer:latest sh -c "whoami && id"
  ```

#### 2. Minimal Base Image
- **Implementation**: Uses `node:22-alpine` as base image
- **Benefit**: 
  - Smaller attack surface (~186MB vs 1GB+ for standard Node images)
  - Fewer vulnerabilities
  - Faster deployment
- **Verification**: 
  ```bash
  docker images grammar-fixer:latest
  ```

#### 3. Security Headers
All HTTP responses include security headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables XSS filter
- `Strict-Transport-Security` - Enforces HTTPS (when applicable)

#### 4. Resource Limits
Docker Compose configuration includes:
```yaml
resources:
  limits:
    cpus: '1'
    memory: 512M
```
- **Benefit**: Prevents resource exhaustion attacks

#### 5. No New Privileges
```yaml
security_opt:
  - no-new-privileges:true
```
- **Benefit**: Prevents privilege escalation within container

#### 6. Health Checks
- **HTTP Health Endpoint**: `GET /health`
- **Docker Health Check**: Automatic monitoring and restart
- **Benefit**: Ensures service availability and automatic recovery

#### 7. .dockerignore
Excludes sensitive and unnecessary files:
- `.git/` - Version control data
- `.env*` - Environment files with secrets
- `tests/` - Test files
- `node_modules/` - Dependencies (installed in container)

#### 8. Graceful Shutdown
- Handles SIGTERM and SIGINT signals
- 10-second timeout for graceful shutdown
- **Benefit**: Prevents data loss and incomplete requests

### Security Scanning

#### Automated Scanning
The project includes automated security scanning in CI/CD:

```yaml
# .github/workflows/docker.yml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'grammar-fixer:latest'
    format: 'sarif'
    severity: 'CRITICAL,HIGH'
```

#### Manual Scanning

##### Using Trivy
```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image grammar-fixer:latest

# Scan with specific severity
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity CRITICAL,HIGH grammar-fixer:latest
```

##### Using Docker Scout
```bash
docker scout cves grammar-fixer:latest
```

##### Using Snyk
```bash
snyk container test grammar-fixer:latest
```

#### Dockerfile Best Practices Check
```bash
# Using Hadolint
docker run --rm -i hadolint/hadolint < Dockerfile

# Using Dockle
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  goodwithtech/dockle grammar-fixer:latest
```

### Network Security

#### Docker Compose Network Isolation
- Uses dedicated bridge network
- Services communicate only through defined ports
- No host network mode

```yaml
networks:
  grammar-fixer-network:
    driver: bridge
```

#### Port Exposure
- Only necessary ports exposed (3000 for HTTP, 11434 for Ollama)
- No privileged port exposure

### Environment Variable Security

#### Secrets Management
**DO NOT** commit sensitive data to `.env` files or Dockerfile.

Use Docker secrets or Kubernetes secrets for production:

```yaml
# Docker Swarm example
secrets:
  ollama_api_key:
    external: true

services:
  grammar-fixer:
    secrets:
      - ollama_api_key
```

#### Recommended Environment Variables
```bash
# Safe to specify
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=gemma3
NODE_ENV=production
PORT=3000

# DO NOT hardcode sensitive data
# Use secret management instead
```

### Production Deployment Checklist

- [ ] Run vulnerability scan before deployment
- [ ] Use specific image tags (not `latest`)
- [ ] Enable read-only root filesystem (if applicable)
- [ ] Configure resource limits
- [ ] Set up logging and monitoring
- [ ] Use secrets management for sensitive data
- [ ] Enable HTTPS/TLS for external communication
- [ ] Implement rate limiting
- [ ] Set up network policies
- [ ] Regular security updates
- [ ] Backup important data

### Additional Security Recommendations

#### 1. Read-Only Root Filesystem
For additional security, enable read-only filesystem:

```yaml
# docker-compose.yml
read_only: true
tmpfs:
  - /tmp
  - /app/.npm
```

#### 2. Capability Dropping
Drop unnecessary Linux capabilities:

```yaml
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE  # Only if needed
```

#### 3. AppArmor/SELinux
Use security profiles:

```yaml
security_opt:
  - apparmor=docker-default
  - no-new-privileges:true
```

#### 4. Network Segmentation
Separate networks for different services:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

### Vulnerability Response

#### Reporting Security Issues
If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for a fix before public disclosure

#### Keeping Up-to-Date

```bash
# Update base image
docker pull node:22-alpine

# Rebuild with latest dependencies
docker-compose build --no-cache

# Update all npm dependencies
npm update

# Check for known vulnerabilities
npm audit
```

### Monitoring and Logging

#### Recommended Monitoring
- Container resource usage (CPU, memory)
- HTTP response times and error rates
- Failed authentication attempts
- Unusual network activity

#### Logging Best Practices
```javascript
// Avoid logging sensitive data
console.log('Processing request', {
  // Good
  method: req.method,
  path: req.url,
  timestamp: new Date(),
  
  // Bad - Don't log
  // password: req.body.password,
  // apiKey: req.headers.authorization,
});
```

### Compliance Considerations

#### GDPR
- Don't log personal data
- Implement data retention policies
- Provide data deletion mechanisms

#### HIPAA (if applicable)
- Encrypt data in transit and at rest
- Implement audit logging
- Use BAA-compliant infrastructure

### Security Updates

This document will be updated as new security features are added or vulnerabilities are discovered.

Last updated: 2024-01-15

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Contact

For security concerns, please contact the repository maintainers.
