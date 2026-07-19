# CivicPath Backend - Deployment Guide (Docker & Cloudflare Tunnel)

This document contains step-by-step instructions for deploying and running the NestJS backend application in production using Docker containers and Cloudflare Tunnels.

---

## Part 1: NestJS Docker Configuration

The NestJS backend application is containerized using a production-optimized multi-stage build.

### 1. File Modifications
* **[package.json](package.json)**:
  Contains `prisma` CLI in the production `dependencies` (`pnpm add -P prisma`) to make it available inside the pruned production image.
* **[Dockerfile](Dockerfile)**:
  * Exposes internal port `3000`.
  * Runs `npx prisma generate` in the production `runner` stage (offline setup).
  * Runs `CMD ["node", "dist/src/main"]` to align with the TS output structure.
* **[docker-compose.shared.yml](docker-compose.shared.yml)**:
  * Sets the container's environment `PORT` to `3000`.
  * Maps host port `3001` to container port `3000` (`"3001:3000"`).
  * Joins the external database (`pgvector_network`) and Redis (`redis_default`) networks.

### 2. Execution Command
Builds and starts the NestJS container in background mode:
```bash
docker compose -f docker-compose.shared.yml up --build -d
```

---

## Part 2: Cloudflare Tunnel Configuration

Since the AIC Cloud provider reserves ports 80 & 443 and blocks direct port-forwarding, we bypass these restrictions by setting up an outbound Cloudflare Tunnel.

### 1. Installation on the VPS
```bash
# Download the latest cloudflared release deb
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install the package
sudo dpkg -i cloudflared.deb
```

### 2. Cloudflare CLI Authentication (No Credit Card Required)
```bash
cloudflared tunnel login
```
* **What it does**: Outputs a verification URL. Opening the link in your browser logs you into Cloudflare, links your account, and downloads the security certificate (`cert.pem`) to `/home/seyalicraft/.cloudflared/cert.pem` on the VPS.

### 3. Tunnel Creation
```bash
cloudflared tunnel create civicpath-tunnel
```
* **What it does**: Connects to Cloudflare's API, registers a secure tunnel, and returns a unique **Tunnel ID** (e.g., `a8ffe740-76af-4916-907d-d590ddc86852`).

### 4. Configuration File (`/etc/cloudflared/config.yml`)
Write the configuration file mapping incoming subdomains to the respective local VPS ports:
```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**File Content**:
```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /home/seyalicraft/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  # 1. Project 1: NestJS Backend API (civicpath-backend)
  - hostname: civipath-api.seyalicraft.com
    service: http://localhost:3001

  # 2. Project 2: Next.js Frontend (civicPath-frontend)
  - hostname: civipath.seyalicraft.com
    service: http://localhost:3000

  # 3. Project 3: Future API/Service
  - hostname: api2.seyalicraft.com
    service: http://localhost:3002

  # 4. Project 4: Future API/Service
  - hostname: api3.seyalicraft.com
    service: http://localhost:3003

  # Catch-all: Required (Must be the last rule)
  - service: http_status:404
```

### 5. DNS Routing Setup
Creates the dynamic CNAME DNS records directly in your Cloudflare DNS table mapping subdomains to the tunnel:
```bash
# DNS route for Project 1 (NestJS Backend)
cloudflared tunnel route dns civicpath-tunnel civipath-api.seyalicraft.com

# DNS route for Project 2 (Next.js Frontend)
cloudflared tunnel route dns civicpath-tunnel civipath.seyalicraft.com
```

### 6. Systemd Daemon Registration
Enables background service persistence so that the tunnel runs automatically when the VPS reboots:
```bash
# Install as a system service
sudo cloudflared --config /etc/cloudflared/config.yml service install

# Enable and start the daemon
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## Part 3: Verification Results

1. **Service Status Check**:
   `sudo systemctl status cloudflared` should return **Active (Running)**.
2. **Endpoint Connection Check**:
   Accessing `https://civipath-api.seyalicraft.com/` should return **Hello World!** successfully.
