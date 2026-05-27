# MyReport

MyReport is a full-stack store management and reporting platform built for retail businesses. It combines a Next.js frontend with a Spring Boot backend to handle billing, invoices, customer management, products, plans, reports, support enquiries, and role-based dashboards for admins and super admins.

## What It Includes

- Admin workspace for billing, customers, products, invoices, notifications, settings, and reports
- Super admin workspace for store onboarding, admin approvals, plan management, invoices, reports, and support workflows
- JWT-based authentication with role-based access control
- Public pricing, contact, about, FAQ, guide, and template pages
- Payment integrations for Razorpay and PayU
- AI/chat assistant route in the frontend with OpenAI or Cerebras-backed responses
- Local development defaults using an H2 database, with MySQL-ready configuration

## Repository Structure

```text
My-report/
|-- client/   Next.js 16 + React 19 frontend
|-- server/   Spring Boot 3 backend
`-- README.md
```

## Tech Stack

**Frontend**

- Next.js 16
- React 19
- Redux Toolkit
- Tailwind CSS 4
- Axios
- Recharts
- Framer Motion

**Backend**

- Spring Boot 3.3
- Spring Security
- Spring Data JPA
- Flyway
- JWT
- H2 for local development
- MySQL connector for production or shared dev databases

## Prerequisites

- Node.js 20+
- npm
- Java 17
- Maven wrapper included in `server/`

## Local Development

### 1. Start the backend

From [`server`](./server):

```powershell
./mvnw spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

Health check:

```text
GET http://localhost:8080/api/health
```

### 2. Start the frontend

From [`client`](./client):

```powershell
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:3004
```

## Environment Variables

The backend loads environment values from `server/.env` or the repository root `.env` if present.

### Backend

Common backend variables:

```env
SERVER_PORT=8080
FRONTEND_ORIGIN=http://localhost:3004
BACKEND_URL=http://localhost:8080

DB_URL=jdbc:h2:file:./target/myreport-local-db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE
DB_USERNAME=sa
DB_PASSWORD=

JWT_SECRET=change-this-in-real-environments
JWT_EXPIRATION_MS=86400000
JWT_REMEMBER_EXPIRATION_MS=604800000

SUPER_ADMIN_EMAIL=ankitapatil00001@gmail.com
SUPER_ADMIN_PASSWORD=Ankita@12345

SMTP_HOST=localhost
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@myreport.local
SMTP_FROM_NAME=MyReport

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

PAYU_MERCHANT_KEY=
PAYU_MERCHANT_SALT=
PAYU_BASE_URL=https://secure.payu.in/_payment
```

Optional seed data toggle:

```env
APP_SEED_DEMO_WORKSPACES=true
```

Note:

- The app starts with an H2 file database by default.
- Schema changes are managed by Flyway migrations in `server/src/main/resources/db/migration`.
- `server/src/main/resources/application-dev.properties` includes commented MySQL-oriented settings you can adapt.
- Change seeded admin credentials before any non-local use.

### Frontend

Create `client/.env.local` when you need custom frontend configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
API_BASE_URL=http://localhost:8080/api

NEXT_PUBLIC_SUPPORT_EMAIL=info@veaglespace.com
NEXT_PUBLIC_SUPPORT_PHONE=+91 8237999101
NEXT_PUBLIC_COMPANY_WEBSITE=https://mr.veaglespace.com
NEXT_PUBLIC_CONTACT_MAPS_URL=
NEXT_PUBLIC_CONTACT_MAP_EMBED_URL=
NEXT_PUBLIC_BASE_PATH=

OPENAI_API_KEY=
OPENAI_MODEL=

CEREBRAS_API_KEY=
CEREBRAS_MODEL=gpt-oss-120b
CEREBRAS_BASE_URL=https://api.cerebras.ai/v1
CHATBOT_MODE=auto
```

## Available Scripts

### Frontend

From [`client`](./client):

```powershell
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

From [`server`](./server):

```powershell
./mvnw spring-boot:run
./mvnw test
```

## Main Application Areas

### Public

- Landing page and product marketing
- Pricing and plans
- Contact and support
- Help resources, templates, and FAQs
- Registration, login, forgot password, and reset password

### Admin

- Dashboard and sales summary
- Customer CRUD and purchase history
- Product CRUD
- Billing and invoice generation
- Reports and exports
- Notifications and account settings
- Plan visibility and billing status

### Super Admin

- Dashboard overview
- Admin account management
- Store onboarding and approvals
- Plan creation and maintenance
- Invoice and report oversight
- Support enquiry management
- Global settings and profile management

## Authentication and Access

- `/api/auth/**` is used for login, registration, password reset, and profile lookup
- `/api/admin/**` is restricted to `ADMIN` and `SUPER_ADMIN`
- `/api/super-admin/**` and `/api/stores/**` are restricted to `SUPER_ADMIN`
- JWT tokens are attached by the frontend Axios client for protected requests

## Payments

Integrated backend routes are present for:

- Razorpay order creation and verification
- PayU order creation, status lookup, and callback handling

Configure payment credentials before testing those flows.

## Notes for Developers

- The frontend runs on port `3004`, not the default Next.js `3000`
- Public plan requests are rewritten through the frontend to the backend `/api/public/plans`
- Database schema is versioned through Flyway instead of `ddl-auto=update`
- The backend seeds a super admin account and starter plans automatically
- Demo workspace seeding is optional and controlled by configuration

## Suggested First Checks

After both apps are running:

1. Open `http://localhost:3004`
2. Confirm `http://localhost:8080/api/health` responds
3. Visit the pricing page to confirm frontend-to-backend public API connectivity
4. Sign in with the seeded super admin account if you are testing local admin flows
