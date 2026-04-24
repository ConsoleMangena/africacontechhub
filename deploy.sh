#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# AfricaContechHub — Production Deployment Script
# Run from the project root on your DigitalOcean VPS.
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# ── Colors ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Pre-flight checks ────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || err "Docker is not installed."
command -v docker compose >/dev/null 2>&1 || err "Docker Compose is not installed."
[ -f "$ENV_FILE" ] || err "$ENV_FILE not found. Copy .env.production.example and fill in your values."

# Load env vars
set -a; source "$ENV_FILE"; set +a

[ -z "${DOMAIN:-}" ] && err "DOMAIN is not set in $ENV_FILE"
[ -z "${SECRET_KEY:-}" ] && err "SECRET_KEY is not set in $ENV_FILE"
[ -z "${ACME_EMAIL:-}" ] && err "ACME_EMAIL is not set in $ENV_FILE"

# ── Subcommands ───────────────────────────────────────────────────────
case "${1:-deploy}" in

  # ── First-time SSL setup ────────────────────────────────────────────
  init-ssl)
    log "Obtaining initial SSL certificate for $DOMAIN..."

    # Temporarily use a self-signed cert so Nginx can start
    mkdir -p ./certbot/conf/live/$DOMAIN
    if [ ! -f ./certbot/conf/live/$DOMAIN/fullchain.pem ]; then
      log "Creating temporary self-signed certificate..."
      openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout ./certbot/conf/live/$DOMAIN/privkey.pem \
        -out ./certbot/conf/live/$DOMAIN/fullchain.pem \
        -subj "/CN=$DOMAIN" 2>/dev/null
    fi

    # Start Nginx with the temporary cert
    log "Starting Nginx..."
    docker compose -f $COMPOSE_FILE up -d frontend

    # Get the real certificate
    log "Requesting Let's Encrypt certificate..."
    docker compose -f $COMPOSE_FILE run --rm certbot \
      certbot certonly --webroot \
      --webroot-path=/var/www/certbot \
      --email "$ACME_EMAIL" \
      --agree-tos \
      --no-eff-email \
      -d "$DOMAIN" \
      -d "www.$DOMAIN"

    # Reload Nginx with the real cert
    log "Reloading Nginx with real certificate..."
    docker compose -f $COMPOSE_FILE exec frontend nginx -s reload

    log "✅ SSL certificate obtained for $DOMAIN"
    ;;

  # ── Standard deploy ─────────────────────────────────────────────────
  deploy)
    log "Deploying AfricaContechHub to $DOMAIN..."

    # Pull latest code (if using git)
    if [ -d .git ]; then
      log "Pulling latest code..."
      git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
    fi

    # Build images
    log "Building Docker images..."
    docker compose -f $COMPOSE_FILE build

    # Run migrations
    log "Running database migrations..."
    docker compose -f $COMPOSE_FILE run --rm backend python manage.py migrate --noinput

    # Collect static files
    log "Collecting static files..."
    docker compose -f $COMPOSE_FILE run --rm backend python manage.py collectstatic --noinput

    # Start/restart services
    log "Starting services..."
    docker compose -f $COMPOSE_FILE up -d

    log "✅ Deployment complete! Site is live at https://$DOMAIN"
    ;;

  # ── Renew SSL ───────────────────────────────────────────────────────
  renew-ssl)
    log "Renewing SSL certificate..."
    docker compose -f $COMPOSE_FILE run --rm certbot certbot renew
    docker compose -f $COMPOSE_FILE exec frontend nginx -s reload
    log "✅ SSL certificate renewed"
    ;;

  # ── View logs ───────────────────────────────────────────────────────
  logs)
    docker compose -f $COMPOSE_FILE logs -f "${2:-}"
    ;;

  # ── Stop ────────────────────────────────────────────────────────────
  stop)
    log "Stopping all services..."
    docker compose -f $COMPOSE_FILE down
    log "✅ All services stopped"
    ;;

  # ── Status ──────────────────────────────────────────────────────────
  status)
    docker compose -f $COMPOSE_FILE ps
    ;;

  # ── Help ────────────────────────────────────────────────────────────
  *)
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  deploy      Build, migrate, and start services (default)"
    echo "  init-ssl    First-time SSL certificate setup"
    echo "  renew-ssl   Manually renew SSL certificate"
    echo "  logs        View service logs (optionally: logs backend)"
    echo "  stop        Stop all services"
    echo "  status      Show service status"
    ;;
esac
