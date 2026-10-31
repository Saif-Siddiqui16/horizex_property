# Project Overview — Horizex Property Pro

## 1. Executive Summary
**Horizex Property Pro** is an enterprise-grade Property Management System (PMS) engineered to streamline end-to-end multi-family, multi-unit, and commercial real estate operations. The platform unifies property portfolio management, tenant onboarding and leasing, multi-stage unit readiness/turnover workflows, double-entry financial accounting, maintenance ticket dispatches, legal TAL (Tribunal administratif du logement) case tracking, and automated multi-channel communication (Email/SMS) into a cohesive, high-performance web application.

---

## 2. Core Value Proposition & Business Domain
Traditional property management involves disparate tools for tenant tracking, accounting, turn-over scheduling, and legal compliance. Horizex Property Pro centralizes these operations into a unified workspace featuring:
* **Multi-Company & Multi-Property Isolation:** Managing distinct corporate entities, parent organizations, and buildings under a single portal with granular RBAC.
* **Turnover & Unit Readiness Pipeline:** Kanban-style tracking of unit preparations (Inspection → Cleaning → Maintenance → Painting → Ready) with turnaround analytics.
* **Unified Rent Collection & Ledger:** Automated monthly rent rolls, split bedroom billing, outstanding dues tracking, bank account reconciliation, and payment receipts.
* **Legal Tribunal Case Management:** Full lifecycle tracking of Quebec TAL legal hearings, evidence attachments, deadlines, and hearing notes.
* **Responsive Multi-Window Workspace:** Tabbed workspace interface supporting split-view navigation across units, leases, and financial dashboards.

---

## 3. Technology Stack Specification

### Frontend Architecture
* **Core Framework:** React 18 (Vite-powered for rapid HMR and optimized production bundles)
* **Language:** TypeScript & Modern ECMAScript
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`) for global UI and client-side session state
* **Server State & Caching:** RTK Query with tag-based cache invalidation and automatic query deduplication
* **Form Handling & Validation:** React Hook Form paired with Zod schema validation
* **Styling & UI Components:** Tailwind CSS, Lucide React icons, and accessible modular components
* **Data Visualization:** Recharts for financial analytics, occupancy rates, and turnover metrics

### Backend Architecture
* **Runtime & Framework:** Node.js with Express.js written in strict TypeScript
* **Object-Relational Mapping (ORM):** Prisma ORM for type-safe database queries, declarative migrations, and relational mapping
* **Database Management System:** PostgreSQL 15+
* **Database Administration GUI:** pgAdmin 4 for live database inspection, query profiling, and backup management
* **API Paradigm:** RESTful JSON API following strict HTTP status code semantics

### Authentication, Security & Hardening
* **Password Hashing:** `bcrypt` with work factor 10+ salt rounds
* **Authentication Scheme:** JSON Web Tokens (JWT) dual-token architecture
  * *Access Token:* Short-lived (15 minutes), passed via `Authorization: Bearer <token>` or memory
  * *Refresh Token:* Long-lived (7 days), stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie
  * *Refresh Token Rotation:* Invalidation of previous refresh token upon renewal to prevent replay attacks
* **Access Control:** Granular Role-Based Access Control (RBAC) middleware supporting:
  * `SUPER_ADMIN`
  * `COMPANY_ADMIN`
  * `PROPERTY_MANAGER`
  * `ACCOUNTANT`
  * `MAINTENANCE_STAFF`
  * `OWNER`
  * `TENANT`
* **Transport Security:** HTTPS / TLS encryption on all public endpoints
* **Security Middleware Suite:**
  * **Helmet:** HTTP response header hardening (CSP, HSTS, X-Frame-Options)
  * **CORS:** Strict origin whitelisting allowing only authorized client domains
  * **Rate Limiting:** `express-rate-limit` to thwart brute-force and DDoS attempts
  * **CSRF Protection:** SameSite cookie isolation and double-submit anti-CSRF token verification
* **Audit Trail:** Immutable database logging of all state-changing mutations (`who`, `what`, `target`, `oldValue`, `newValue`, `timestamp`, `ipAddress`)

---

## 4. System Actor Personas

| Persona | Primary Responsibilities | Key Views Accessed |
|---|---|---|
| **Super Admin** | Platform configuration, multi-company provisioning, system audit logs, global permissions | Settings, Companies, Team Management, Audit Logs |
| **Property Manager** | Building maintenance, unit readiness pipelines, lease signings, tenant communications | Dashboard, Units, Readiness, Leases, Maintenance, Tenants |
| **Accountant** | Rent collection, bank accounts, invoicing, tax configurations, financial statements | Bank Accounts, Rent Collection, Chart of Accounts, Invoices, Tax Settings |
| **Maintenance Staff** | Work order execution, turn-over preparation tasks, upload repair proof | Maintenance Tickets, Unit Readiness, Clock-in/Clock-out |
| **Tenant** | Pay rent, view lease terms, submit repair requests, register parking vehicles | Tenant Portal, My Lease, Payments, Repair Requests |
| **Property Owner** | High-level portfolio performance, cash flow, occupancy rates, net operating income | Owner Dashboard, Reports, Revenue Analytics |

---

## 5. High-Level Project Directory Structure

```
Property-Pro-Saif/
├── docs/                                # Master Architecture & System Contracts
│   ├── PROJECT_OVERVIEW.md             # This document
│   ├── ARCHITECTURE.md                 # System diagrams, DB schemas, Auth flows
│   ├── API_CONTRACT.md                 # Complete 70+ endpoint REST contract & Zod schemas
│   └── BUSINESS_RULES.md               # Domain logic, accounting rules & workflows
├── horizex_property/                   # Frontend React Application
│   ├── src/
│   │   ├── api/                        # API client gateway (Axios & RTK Query bases)
│   │   ├── components/                 # Reusable UI components & modals
│   │   ├── context/                    # WorkspaceContext (tabs, split-view)
│   │   ├── layouts/                    # Sidebar, Topbar, MainLayout
│   │   ├── pages/                      # 60+ domain views (Units, Leases, Accounting, etc.)
│   │   ├── store/                      # Redux Toolkit store, slices, RTK Query services
│   │   └── utils/                      # Formatting, currency, date helpers
│   └── package.json
└── backend/                            # Node.js + Express + TypeScript + Prisma
    ├── prisma/
    │   ├── schema.prisma               # Master 24-table PostgreSQL schema
    │   └── seed.ts                     # Seed initial Super Admin, Company, Unit Types
    ├── src/
    │   ├── config/                     # Configuration
    │   │   ├── db.ts                   # Prisma Client single instance
    │   │   ├── env.ts                  # Zod environment variable validation
    │   │   └── cors.ts                 # CORS origin whitelist
    │   ├── middlewares/                # Middlewares
    │   │   ├── auth.middleware.ts      # JWT Access Token authentication
    │   │   ├── rbac.middleware.ts      # Role-Based Access Control guard
    │   │   ├── validate.middleware.ts  # Zod request body/query validator
    │   │   ├── rateLimiter.ts          # Rate limiting (DDoS & Brute-force guard)
    │   │   └── errorHandler.ts         # Global exception & error handler
    │   ├── utils/                      # Helper Utilities
    │   │   ├── password.util.ts        # bcrypt hashing and comparison
    │   │   ├── jwt.util.ts             # Access & Refresh token signing/verification
    │   │   ├── auditLogger.util.ts     # Immutable AuditLog writer
    │   │   └── apiResponse.util.ts     # Standardized JSON response envelope
    │   ├── modules/                    # Feature Modules (Vertical Slices)
    │   │   ├── auth/                   # auth.controller.ts, auth.service.ts, auth.routes.ts, auth.schema.ts
    │   │   ├── companies/              # companies.controller.ts, companies.service.ts, companies.routes.ts, companies.schema.ts
    │   │   ├── properties/             # properties.controller.ts, properties.service.ts, properties.routes.ts, properties.schema.ts
    │   │   ├── units/                  # units.controller.ts, units.service.ts, units.routes.ts, units.schema.ts, readiness.controller.ts
    │   │   ├── tenants/                # tenants.controller.ts, tenants.service.ts, tenants.routes.ts, tenants.schema.ts, vehicles.controller.ts
    │   │   ├── leases/                 # leases.controller.ts, leases.service.ts, leases.routes.ts, leases.schema.ts, renewals.controller.ts
    │   │   ├── accounting/             # invoices.controller.ts, payments.controller.ts, accounts.controller.ts, accounting.service.ts, accounting.routes.ts, accounting.schema.ts
    │   │   ├── maintenance/            # maintenance.controller.ts, maintenance.service.ts, maintenance.routes.ts, maintenance.schema.ts
    │   │   ├── talCases/               # talCases.controller.ts, talCases.service.ts, talCases.routes.ts, talCases.schema.ts
    │   │   ├── communications/         # communications.controller.ts, communications.service.ts, communications.routes.ts
    │   │   └── analytics/              # analytics.controller.ts, analytics.service.ts, analytics.routes.ts
    │   ├── routes.ts                   # Master router combining all /api routes
    │   ├── app.ts                      # Express app setup (Helmet, CORS, Cookies)
    │   └── server.ts                   # Server entry point (Port listener & DB connect)
    ├── .env                            # DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN
    ├── .env.example
    ├── .gitignore
    ├── tsconfig.json                   # TypeScript compiler options
    └── package.json
```

