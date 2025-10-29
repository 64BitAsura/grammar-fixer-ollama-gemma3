# Docker Hub Publishing Setup

This document explains how to set up automated Docker image publishing to Docker Hub via GitHub Actions.

## Overview

The `.github/workflows/docker.yml` workflow automatically builds, scans, and publishes Docker images to Docker Hub when changes are pushed to the `main` or `master` branch.

## Workflow Steps

1. **Build and Scan Job**
   - Builds the Docker image
   - Runs Trivy security vulnerability scanner
   - Tests the Docker image functionality
   - Verifies security configurations

2. **Publish Job** (runs only on push to main/master)
   - Logs in to Docker Hub using secrets
   - Tags the image with multiple tags
   - Pushes the image to Docker Hub

## Required GitHub Secrets

To enable automated publishing, you need to configure two secrets in your GitHub repository:

### 1. DOCKERHUB_USERNAME

Your Docker Hub username.

**How to set:**
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DOCKERHUB_USERNAME`
5. Value: Your Docker Hub username (e.g., `johndoe`)

### 2. DOCKERHUB_TOKEN

A Docker Hub access token (NOT your Docker Hub password).

**How to create and set:**

1. **Create the token on Docker Hub:**
   - Log in to [Docker Hub](https://hub.docker.com)
   - Click on your profile → **Account Settings**
   - Go to **Security** section
   - Click **New Access Token**
   - Enter a description: `GitHub Actions - grammar-fixer-ollama-gemma3`
   - Choose permissions: **Read, Write, Delete** (or **Read & Write** if available)
   - Click **Generate**
   - **IMPORTANT:** Copy the token immediately (you won't be able to see it again!)

2. **Add the token to GitHub:**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `DOCKERHUB_TOKEN`
   - Value: Paste the token you copied from Docker Hub
   - Click **Add secret**

## Image Naming and Tags

The workflow uses the `docker/metadata-action` to automatically generate tags based on the Git context:

### Naming Convention

```
<DOCKERHUB_USERNAME>/grammar-fixer-ollama-gemma3:<tag>
```

### Generated Tags

| Trigger | Tags Generated | Example |
|---------|---------------|---------|
| Push to main/master | `latest`, `main`, `main-<sha>` | `latest`, `main`, `main-abc1234` |
| Push to other branch | `<branch>`, `<branch>-<sha>` | `develop`, `develop-xyz5678` |

### Examples

If your Docker Hub username is `johndoe`:

- `johndoe/grammar-fixer-ollama-gemma3:latest` (only on main/master)
- `johndoe/grammar-fixer-ollama-gemma3:main`
- `johndoe/grammar-fixer-ollama-gemma3:main-a1b2c3d`

## Publishing Conditions

The publish job only runs when:

1. ✅ The build-and-scan job completes successfully
2. ✅ The event is a `push` (not a pull request)
3. ✅ The branch is `main` or `master`

This ensures:
- Only tested and scanned images are published
- Pull requests don't trigger publishing
- Development branches don't clutter the registry

## Manual Publishing

If you need to manually publish an image:

```bash
# 1. Build the image locally
docker build -t grammar-fixer:latest .

# 2. Tag it for Docker Hub
docker tag grammar-fixer:latest your-username/grammar-fixer-ollama-gemma3:v1.0.0

# 3. Log in to Docker Hub
docker login

# 4. Push the image
docker push your-username/grammar-fixer-ollama-gemma3:v1.0.0
```

## Pulling Published Images

Once published, anyone can pull your images:

```bash
# Pull the latest version
docker pull your-username/grammar-fixer-ollama-gemma3:latest

# Pull a specific version
docker pull your-username/grammar-fixer-ollama-gemma3:main-abc1234

# Run the pulled image
docker run -d \
  -p 3000:3000 \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  your-username/grammar-fixer-ollama-gemma3:latest
```

## Troubleshooting

### Error: "denied: requested access to the resource is denied"

**Cause:** Invalid credentials or insufficient permissions.

**Solution:**
1. Verify `DOCKERHUB_USERNAME` secret is correct
2. Verify `DOCKERHUB_TOKEN` secret is a valid access token
3. Ensure the token has "Write" permissions
4. Check if the repository exists on Docker Hub (it will be auto-created on first push if not)

### Error: "repository name must be lowercase"

**Cause:** Docker Hub repository names must be lowercase.

**Solution:**
- The workflow automatically uses lowercase for the image name
- Ensure your `DOCKERHUB_USERNAME` secret is lowercase

### Images not being published

**Check:**
1. Are you pushing to `main` or `master` branch?
2. Did the `build-and-scan` job complete successfully?
3. Are the secrets configured correctly?
4. Check the Actions tab on GitHub for detailed logs

### How to verify the workflow

```bash
# Check the workflow file syntax (if Python is available)
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/docker.yml'))"

# Or use GitHub's CLI to validate workflows
gh workflow view "Docker Build and Security Scan"

# Or push to a branch and check the Actions tab for validation
# GitHub automatically validates workflow syntax on push

# View workflow runs in GitHub
# Go to: Repository → Actions → Docker Build and Security Scan
```

## Security Best Practices

1. **Never use your Docker Hub password in GitHub secrets**
   - Always use access tokens
   - Tokens can be revoked without changing your password

2. **Use minimal permissions**
   - Token only needs "Read & Write" permissions
   - Don't give admin access unless necessary

3. **Rotate tokens regularly**
   - Create new tokens periodically
   - Delete old tokens after updating secrets

4. **Monitor access**
   - Check Docker Hub security events regularly
   - Review GitHub Actions logs for suspicious activity

5. **Scan published images**
   - The workflow includes Trivy vulnerability scanning
   - Only publish images that pass security checks

## Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Login Action](https://github.com/docker/login-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)

## Support

If you encounter issues:
1. Check the [Actions tab](../../actions) for detailed logs
2. Review this documentation
3. Check [DOCKER.md](../../DOCKER.md) for Docker-specific information
4. Open an issue in the repository
