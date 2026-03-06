# LuxeStay Hotel Management System

This is a complete Hotel Booking Management System composed of a static web frontend and a robust NestJS backend API.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS (Static files, easy to deploy behind NGINX or similar). Located in the root and `js/`, `css/` folders.
- **Backend / API**: NestJS (TypeScript) with Prisma ORM connecting to a PostgreSQL database. Located in the `/backend` directory.

## Prerequisites

1. **Node.js**: v18 or later.
2. **PostgreSQL**: A running PostgreSQL database instance.
3. **HTTP Server (Frontend)**: Any static file server (e.g., `serve`, `live-server`, or Python's `http.server`).

---

## Backend Setup & Execution

The backend provides the API for Rooms, Bookings, Payments, and User Management.

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory based on the provided `.env.example`. You **must** set the following:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_db?schema=public"

# JWT Secret for Auth
JWT_SECRET="your-super-secret-key-change-in-production"

# CORS configuration (set to * or frontend URL)
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"

# Add Real API keys here for advanced integrations:
# STRIPE_SECRET_KEY="sk_test_..."
# SENDGRID_API_KEY="SG...."
```

### 3. Database Migration & Seeding
Apply the database schema and populate it with initial data (Rooms, Promos, Admin Users).
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Start the Backend Server
```bash
# Development mode
npm run start:dev
```
The API will be available at `http://localhost:4000/api/v1`.
You can view the Swagger API documentation at `http://localhost:4000/api/docs`.

---

## Frontend Setup & Execution

The frontend is fully static and communicates with the backend via REST API calls.

### 1. Configure API Endpoint (If needed)
By default, the frontend is configured to talk to `http://localhost:4000/api/v1`. If your backend runs on a different port/host, update the `API_BASE_URL` constant at the top of `js/main.js`.

### 2. Serve the Frontend
You must serve the frontend files using a local web server (opening the HTML files directly via `file://` protocols in a browser will cause CORS/fetch issues).

You can use any static server. If you have Node installed, the easiest way is:
```bash
# From the project root (where this README is)
npx serve -l 3000
```
Then open `http://localhost:3000` in your web browser.

---

## Testing the Application

1. Open `http://localhost:3000` in your browser.
2. The **Featured Rooms** on the homepage are fetched dynamically from the DB.
3. Click on **Rooms & Suites** to see the full list of rooms (fetched from the DB), and test the filtering mechanics.
4. Click on **View Details** for a room, fill out the booking form, and click **Book Now**.
5. The frontend will hit the backend to secure the booking and initiate a pending payment in the database.

## Integrating Advanced Features (Real API Keys)

To make the system "production-ready/sellable", you can implement real external APIs in the backend:

1. **Payments**: Navigate to `backend/src/payments/payments.service.ts`. Inside the `create` method, you can integrate the Stripe or Paystack Node.js SDKs using the keys from your `.env` file. Replace the mock transaction logic with a real API call to the payment provider.
2. **Email Notifications**: Navigate to `backend/src/notifications/`. You can integrate SendGrid or AWS SES to send real confirmation emails when a booking is created or updated.

---
**Enjoy the LuxeStay Experience!**
