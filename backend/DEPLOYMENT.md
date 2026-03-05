# Deployment Guide - Hotel Management Backend

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Docker (optional)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for JWT signing (min 32 chars) |
| JWT_EXPIRES_IN | No | Access token expiry (default: 15m) |
| PORT | No | Server port (default: 4000) |
| NODE_ENV | No | development \| production |
| CORS_ORIGIN | No | Allowed origins (comma-separated) |

## Production Deployment

### 1. Database

Create PostgreSQL database:

```sql
CREATE DATABASE hotel_db;
CREATE USER hotel_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_app;
```

### 2. Build

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:prod
npm run build
```

### 3. Run

```bash
NODE_ENV=production node dist/main.js
```

### 4. Process Manager (PM2)

```bash
pm2 start dist/main.js --name hotel-api
pm2 save
pm2 startup
```

## Docker Deployment

```bash
# Build
docker build -t hotel-api .

# Run with PostgreSQL
docker-compose up -d

# Or use external DB
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  hotel-api
```

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL (Let's Encrypt)

```bash
certbot --nginx -d api.yourdomain.com
```

## Health Check

The API runs on the configured PORT. A simple health check:

```bash
curl http://localhost:4000/api/v1/rooms
```

## Seed Data

Run seed only once in a fresh environment:

```bash
npm run prisma:seed
```

## Migrations

For production schema updates:

```bash
npx prisma migrate deploy
```
