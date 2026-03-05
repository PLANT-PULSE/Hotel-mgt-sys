# Hotel Management System - Backend API

Production-ready NestJS backend for the Hotel Management System with PostgreSQL, Prisma ORM, JWT auth, and RBAC.

## Architecture

- **Framework**: NestJS (scalable, modular, TypeScript-first)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT access + refresh tokens, bcrypt password hashing
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger/OpenAPI at `/api/docs`

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema (3NF)
│   ├── seed.ts          # Seed script
│   └── migrations/      # Migration history
├── src/
│   ├── auth/            # JWT, register, login, refresh
│   ├── users/           # User profile
│   ├── rooms/           # Room types, inventory
│   ├── bookings/        # Bookings, promo codes
│   ├── payments/        # Payment processing
│   ├── guests/          # Guest management
│   ├── staff/           # Staff management
│   ├── dashboard/       # Analytics
│   ├── notifications/   # Email-ready notifications
│   ├── common/          # Filters, interceptors, logger
│   └── prisma/          # Prisma service
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed dummy data
npm run prisma:seed
```

### 4. Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Auth (Public)
- `POST /api/v1/auth/register` - Register guest
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Rooms (Public)
- `GET /api/v1/rooms` - List room types
- `GET /api/v1/rooms/:id` - Room type by ID
- `GET /api/v1/add-ons` - List add-ons

### Bookings
- `POST /api/v1/bookings` - Create booking (public)
- `GET /api/v1/bookings/lookup/:number` - Lookup by LXS-2024-00123 (public)
- `GET /api/v1/bookings/my` - My bookings (auth)
- `GET /api/v1/bookings` - All bookings (staff)
- `PATCH /api/v1/bookings/:id/status` - Update status (staff)

### Payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment

### Promo Codes (Public)
- `GET /api/v1/promo-codes` - List promos
- `POST /api/v1/promo-codes/validate` - Validate code

### Admin/Staff
- `GET /api/v1/users/me` - Current user
- `GET /api/v1/guests` - List guests
- `GET /api/v1/staff` - List staff
- `GET /api/v1/dashboard/stats` - Dashboard stats
- `GET /api/v1/dashboard/revenue` - Revenue overview

## Demo Credentials (after seed)

| Role        | Email                   | Password   |
|-------------|-------------------------|------------|
| Admin       | admin@luxehotel.com     | Password123! |
| Manager     | manager@luxehotel.com   | Password123! |
| Receptionist| reception@luxehotel.com | Password123! |
| Guest       | guest@example.com       | Password123! |

## Docker Deployment

```bash
# Build and run
docker-compose up -d

# With custom env
JWT_SECRET=your-secret docker-compose up -d
```

## Security

- JWT 15min access, 7-day refresh
- bcrypt password hashing
- Rate limiting (100 req/min)
- CORS, Helmet
- Input validation on all endpoints
- Role-based access (Admin, Manager, Receptionist, Guest)

## Swagger

Visit `http://localhost:4000/api/docs` when the server is running.
