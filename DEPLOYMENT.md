# AfricaContechHub - DigitalOcean VPS Deployment Guide

This guide documents the exact process for deploying the AfricaContechHub application to a production environment (specifically a DigitalOcean VPS).

## 1. Prerequisites
- A DigitalOcean Droplet (Ubuntu 22.04 or 24.04 recommended)
- A domain name pointing to the droplet's IP address (A record)
- SSH root access to the droplet
- Required project secrets (Supabase keys, AI API keys, Django Secret Key)

## 2. Server Setup (First Time Only)

1. **SSH into the server:**
   ```bash
   ssh root@<DROPLET_IP>
   ```

2. **Install Docker & Docker Compose:**
   ```bash
   apt-get update && apt-get install -y docker.io docker-compose-v2 git ufw
   systemctl enable --now docker
   ```

3. **Configure the Firewall (UFW):**
   ```bash
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow OpenSSH
   ufw allow 'Nginx Full'  # Port 80 and 443
   ufw --force enable
   ```

4. **Clone the Repository:**
   ```bash
   git clone https://github.com/ConsoleMangena/africacontechhub.git /opt/africacontechhub
   cd /opt/africacontechhub
   ```

## 3. Environment Configuration

1. **Copy the example configuration:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Edit the configuration file:**
   ```bash
   nano .env.production
   ```
   *Crucial values to update:*
   - `DOMAIN`: Your public domain (e.g., `africacontechhub.com`)
   - `ACME_EMAIL`: Email for Let's Encrypt renewal notices
   - `SECRET_KEY`: A cryptographically secure random string (do not reuse local ones)
   - `DATABASE_URL`: The production database connection string
   - `SUPABASE_*` and `VITE_SUPABASE_*`: Production Supabase credentials
   - `ANTHROPIC_API_KEY`: production API key

## 4. Initial SSL Setup (Chicken-and-Egg Problem)

Nginx requires valid SSL certificates to start, but Certbot requires Nginx to validate the domain. To solve this, run the initialization script:

```bash
cd /opt/africacontechhub
./deploy.sh init-ssl
```
*This script temporarily halts existing containers, requests a dry-run standalone certificate, ensures Let's Encrypt provisions the real keys, and then leaves the system ready for Nginx.*

> [!WARNING]
> If you are using a proxy tunnel for an IPv6-only database (like Supabase direct connection), ensure your tunnel is running on the host before migrating.

## 5. Main Deployment

Once initialized (or for regular subsequent updates), use the deployment script:

```bash
cd /opt/africacontechhub
git pull origin main
./deploy.sh deploy
```

This command will:
1. Rebuild the frontend and backend Docker Compose images to reflect code changes.
2. Run Django database migrations automatically.
3. Restart the updated containers with zero-downtime recreation.
4. Clean up dangling and unused images to preserve VPS disk space.

## 6. Architecture Notes

- **Network:** The Django backend is not exposed to the public internet directly. Nginx proxies requests from port 443 to port 8000 via Docker's internal bridge network.
- **Static Files:** Django static files and user media are collected into shared Docker volumes (`backend_static` and `backend_media`) which Nginx reads directly for maximum performance.
- **SSL Auto-Renewal:** A `certbot` container runs silently in the background checking every 12 hours if Let's Encrypt certificates need renewal.
