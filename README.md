# Dezoryn Contractor

> Industrial Highway Infrastructure & Product Manufacturer Platform.

Dezoryn Contractor is a full-stack, enterprise-grade digital platform engineered for industrial highway product manufacturing, automated lead procurement, project media showcasing, and comprehensive administrative operations.

---

## 🏛️ System Architecture

The repository is structured as a unified monorepo containing three interconnected applications:

```
dezoryn-contractor/
├── app/                  # Next.js 16 (App Router) Public Highway Platform
├── frontend/             # High-Performance UI Components & Dynamic Visuals
├── admin/                # React + Vite Standalone Admin Control Portal (Port 3001)
├── backend/              # Express.js + Prisma ORM Standalone REST API (Port 5000)
├── shared/               # Shared TypeScript Types, Zod Schemas & Constants
├── prisma/               # PostgreSQL Database Schema & Versioned Migrations
└── tests/                # Automated Regression & Forensic Test Suites
```

1. **Public Web Portal (`/app`, `/frontend`)**:
   - Next.js 16 with Turbopack, responsive multi-page layout, product catalog, interactive BOQ quotation desk, and showcase gallery.
2. **Admin Control Centre (`/admin`)**:
   - Independent Single-Page Application (SPA) powered by React & Vite.
   - Comprehensive dashboard for managing products, gallery media, incoming quotation leads, website SEO metadata, and Brevo SMTP settings.
3. **Backend API Server (`/backend`)**:
   - Standalone Express.js REST API service with JWT authentication (short-lived access tokens + rotating HTTP-only refresh tokens), strict origin validation, rate limiting, and PostgreSQL persistence via Prisma ORM.
4. **Email Notification Engine (`Brevo + Nodemailer`)**:
   - Automatic transactional email dispatches for new quotation requests with HTML sanitization, recipient configuration, and live connection diagnostics.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 22.13.0`
- **PostgreSQL**: `>= 14.0` (Running locally or hosted)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` to `.env` (and `backend/.env`):
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dezoryn_db?schema=public"

# Authentication
JWT_ACCESS_SECRET="your-256-bit-access-secret"
JWT_REFRESH_SECRET="your-256-bit-refresh-secret"

# URLs & CORS
NEXT_PUBLIC_API_URL="http://localhost:5000"
ADMIN_BASE_URL="http://localhost:3001"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### 3. Database Migration & Seeding
Apply version-controlled Prisma migrations and seed default administrative credentials:
```bash
npm run db:deploy
npm run db:seed
```

### 4. Running the Development Environment
Launch all 3 services concurrently with a single command:
```bash
npm run dev
```
- **Public Portal**: `http://localhost:3000`
- **Admin Control Centre**: `http://localhost:3001`
- **Backend REST API**: `http://localhost:5000`

---

## 🧪 Testing & Verification

Run the full automated test suite (43 test cases across Auth, Data Persistence, Email, Gallery, and Products):
```bash
npm test
```

Build all production workspaces:
```bash
npm run build
```

---

## 🔒 Security Posture

- **Zero Secret Exposure**: Database credentials, SMTP secrets, and JWT private keys are strictly masked and never returned to the frontend.
- **CSRF & Origin Protection**: Strict exact-origin verification and URL hostname checking prevent malicious cross-site origins.
- **Rate Limiting**: Public quotation forms and authentication endpoints are protected by IP-based rate limiting.
- **Atomic Operations**: Product sortOrder ordering and media mutations are wrapped in transactional PostgreSQL exclusive locks.

---

## 📄 License
Private & Confidential — Dezoryn Contractor.
