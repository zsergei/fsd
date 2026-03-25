# Deployment Guide

See [README.md](README.md) for a project overview.

## Prerequisites

### Server requirements

- **OS:** Ubuntu 22.04+ (or any Debian-based Linux)
- **CPU:** 2+ vCPU
- **RAM:** 4 GB minimum (2 GB swap recommended)
- **Disk:** 40 GB SSD minimum
- **Network:** public IPv4 address, ports 80 and 443 open

### Domain

A domain name must be pointed to the server's IP address (A record) **before** starting the deployment. SSL certificate generation will fail otherwise.

### Repository access

The server needs read access to the Bitbucket repository. A deploy key (ED25519) is used for this.

---

## Initial setup

### 1. System packages

```bash
apt update && apt upgrade -y
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

Install Node.js 22 (for frontend build):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
```

Install Certbot (for SSL):

```bash
apt install -y certbot
```

### 2. Swap (if RAM < 4 GB)

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 3. SSH deploy key

```bash
ssh-keygen -t ed25519 -C "deploy@fsd" -f /root/.ssh/id_ed25519 -N ""
cat /root/.ssh/id_ed25519.pub
```

Add the public key as an **Access Key** in Bitbucket: Repository settings > Access keys > Add key.

### 4. Clone the repository

```bash
git clone -b dev git@github.com:zsergei/fsd.git /opt/fsd-app
```

### 5. Build the frontend

```bash
cd /opt/fsd-app/frontend && npm ci && npm run build
```

### 6. Airtable OAuth integration

Create an OAuth integration at [https://airtable.com/create/oauth](https://airtable.com/create/oauth) with the following settings:

- **Name:** any descriptive name (e.g. "FSD App")
- **Homepage URL:** `https://YOUR_DOMAIN`
- **Redirect URL:** `https://YOUR_DOMAIN/api/oauth/airtable/callback`
- **Terms of service URL:** `https://YOUR_DOMAIN/legal/terms-of-service`
- **Privacy policy URL:** `https://YOUR_DOMAIN/legal/privacy-policy`

Select the following **scopes**:

- `schema.bases:read` -- read base and table structure
- `data.records:read` -- read record data
- `user.email:read` -- read authenticated user's email

After creation, copy the **Client ID** and **Client secret** from the integration page. You will need them in the next step.

### 7. Environment files

Create `.env` from the template:

```bash
cd /opt/fsd-app && cp .env.example .env
```

Generate and insert JWT secrets:

```bash
JWT1=$(openssl rand -hex 32) && JWT2=$(openssl rand -hex 32)
sed -i "s|JWT_SESSION_SECRET=<GENERATE_ME>|JWT_SESSION_SECRET=$JWT1|" .env
sed -i "s|JWT_REFRESH_SECRET=<GENERATE_ME>|JWT_REFRESH_SECRET=$JWT2|" .env
```

Insert Airtable OAuth credentials (replace with your actual values):

```bash
sed -i "s|AIRTABLE_CLIENT_ID=<FROM_AIRTABLE_DEVELOPER_PORTAL>|AIRTABLE_CLIENT_ID=your-client-id|" .env
sed -i "s|AIRTABLE_CLIENT_SECRET=<FROM_AIRTABLE_DEVELOPER_PORTAL>|AIRTABLE_CLIENT_SECRET=your-client-secret|" .env
sed -i "s|YOUR_DOMAIN|your-actual-domain.com|g" .env
```

Review `.env` and verify that `FRONTEND_URL`, `AIRTABLE_OAUTH_REDIRECT_URI`, and Airtable credentials are correct. The `.env.docker` file is already in the repository and requires no changes.

### 8. SSL certificate

Stop any service occupying port 80, then:

```bash
systemctl stop nginx 2>/dev/null; systemctl disable nginx 2>/dev/null
certbot certonly --standalone -d YOUR_DOMAIN
```

Set up auto-renewal hook:

```bash
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
docker compose -f /opt/fsd-app/docker-compose.yml -f /opt/fsd-app/docker-compose.prod.yml exec web nginx -s reload
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

### 9. Update nginx config

Edit `docker/nginx/production.conf` and replace `fsd.zayserser.link` with your domain in `server_name`, `ssl_certificate`, and `ssl_certificate_key` directives.

### 10. Build and launch

```bash
cd /opt/fsd-app
docker compose -f docker-compose.yml -f docker-compose.prod.yml build api
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 11. Verify

```bash
curl -s https://YOUR_DOMAIN/api/health
```

Expected response: `{"service":"FSD App API","env":"production","status":"ok","database":"ok"}`

### 12. OpenAPI / Swagger UI

The API is documented with **OpenAPI** and served as interactive **Swagger UI**. After deployment, open **`https://YOUR_DOMAIN/doc`** in a browser (replace `YOUR_DOMAIN` with your public hostname) to see all routes, parameters, and schemas, and to try requests from the page when the operation allows it.

---

## Deploy script

Create a reusable deploy script on the server:

```bash
cat > /opt/fsd-app/deploy.sh << 'EOF'
#!/bin/bash
set -e
cd /opt/fsd-app

echo "==> Pulling latest code..."
git pull origin dev

echo "==> Building frontend..."
npm ci --prefix frontend
npm run build --prefix frontend

echo "==> Building and restarting containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build api
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "==> Reloading nginx (apply updated docker/nginx/*.conf bind mounts)..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec web nginx -s reload

echo "==> Done!"
EOF
chmod +x /opt/fsd-app/deploy.sh
```

Add an alias for convenience:

```bash
echo 'alias deploy="/opt/fsd-app/deploy.sh"' >> ~/.bashrc && source ~/.bashrc
```

After this, deploying new changes is a single command from any directory:

```bash
deploy
```

---

## Useful commands

Clear all data in the database:

```bash
cd /opt/fsd-app && docker compose -f docker-compose.yml -f docker-compose.prod.yml exec mongo mongosh --quiet --eval 'db = db.getSiblingDB("fsd_app"); db.getCollectionNames().forEach(c => { const r = db[c].deleteMany({}); print(c + ": deleted " + r.deletedCount); });'
```

View API logs:

```bash
cd /opt/fsd-app && docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 api
```

Restart all services:

```bash
cd /opt/fsd-app && docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

---
