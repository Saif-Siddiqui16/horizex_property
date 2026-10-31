# REST API Contract & Specification — Horizex Property Pro

## 1. Global Standards & Protocols

### Base URL & Versioning
* Development: `http://localhost:5000/api`
* Production: `https://api.yourdomain.com/api`

### Standard Response Envelope
All API responses adhere to the standard JSON envelope:

#### Success Envelope (200 OK, 201 Created)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-10-31T12:00:00.000Z",
    "total": 120,
    "page": 1,
    "limit": 20
  }
}
```

#### Error Envelope (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      { "field": "email", "issue": "Invalid email format" }
    ]
  }
}
```

---

## 2. Authentication & Session Module (`/api/auth`)

### `POST /api/auth/login`
Authenticates user credentials and establishes dual-token session.
* **Auth Required:** None (Public)
* **Request Body (Zod Schema):**
  ```typescript
  z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
  ```
* **Response (200 OK):**
  * *Set-Cookie Header:* `refreshToken=...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  * *Payload:*
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOi...",
        "user": {
          "id": "uuid-v4",
          "email": "manager@horizex.com",
          "firstName": "Saif",
          "lastName": "Admin",
          "role": "PROPERTY_MANAGER",
          "companyId": "uuid-v4"
        }
      }
    }
    ```

### `POST /api/auth/refresh`
Issues a new short-lived Access Token using the `HttpOnly` Refresh Cookie with token rotation.
* **Auth Required:** Valid Refresh Cookie
* **Response (200 OK):**
  * *Set-Cookie Header:* `refreshToken=newRotatedToken; HttpOnly; Secure; SameSite=Lax`
  * *Payload:* `{ "success": true, "data": { "accessToken": "eyJhbGci..." } }`

### `POST /api/auth/logout`
Revokes refresh token in database and wipes client cookie.
* **Auth Required:** Bearer Access Token
* **Response (200 OK):**
  * *Set-Cookie Header:* `refreshToken=; HttpOnly; Max-Age=0`
  * *Payload:* `{ "success": true, "data": { "message": "Logged out successfully" } }`

### `GET /api/auth/me`
Fetches authenticated user identity and effective permission matrix.
* **Auth Required:** Bearer Access Token
* **Response (200 OK):** Current user object with company profile and role.

---

## 3. Companies & Organizations (`/api/admin/companies`)

### `GET /api/admin/companies`
Lists all managed corporate entities.
* **Auth / RBAC:** `SUPER_ADMIN`, `COMPANY_ADMIN`, `PROPERTY_MANAGER`
* **Response (200 OK):** Array of Company objects with properties count and contact info.

### `POST /api/admin/companies`
Provisions a new management company entity.
* **Auth / RBAC:** `SUPER_ADMIN`
* **Request Body:** `{ name: string, code: string, contactEmail: string, contactPhone?: string }`

---

## 4. Properties & Buildings (`/api/admin/properties`)

### `GET /api/admin/properties`
Fetches buildings list filtered by corporate entity.
* **Auth / RBAC:** `SUPER_ADMIN`, `COMPANY_ADMIN`, `PROPERTY_MANAGER`, `ACCOUNTANT`, `OWNER`
* **Query Params:** `?companyId=uuid&search=boulevard`
* **Response (200 OK):** Array of property objects with unit occupancy summaries.

### `POST /api/admin/properties`
Creates a new property portfolio entry.
* **Auth / RBAC:** `SUPER_ADMIN`, `COMPANY_ADMIN`
* **Request Body (Zod):**
  ```typescript
  z.object({
    companyId: z.string().uuid(),
    name: z.string().min(2),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string()
  })
  ```

### `GET /api/admin/properties/:id`
Returns property details including unit breakdown, financial KPIs, and active leases.

### `PUT /api/admin/properties/:id`
Updates building address, total units count, and contact person.

### `DELETE /api/admin/properties/:id`
Performs soft-deletion of property record (requires 0 active leases).

---

## 5. Units & Turnover Readiness (`/api/admin/units` & `/api/admin/readiness`)

### `GET /api/admin/units`
List units with comprehensive filtering.
* **Query Params:** `?propertyId=uuid&status=VACANT&bedrooms=2&minRent=1000&maxRent=2500`
* **Response (200 OK):** Array of Units with tenant names, current rent, and readiness stage.

### `POST /api/admin/units`
Registers a new unit or apartment under a property.
* **Request Body:** `{ propertyId: string, unitNumber: string, floor: number, bedrooms: number, bathrooms: number, baseRent: number }`

### `GET /api/admin/units/:id`
Returns unit details, lease history, open repair tickets, and vehicle allocations.

### `PUT /api/admin/units/:id`
Updates base rent, status (`VACANT`, `OCCUPIED`, `TURNOVER`), or specs.

### `GET /api/admin/readiness/dashboard`
Returns unit turn-over pipeline grouped by Kanban stages:
* `NOTICE_GIVEN` → `MOVE_OUT_INSPECTION` → `MAINTENANCE_REPAIRS` → `PAINTING` → `DEEP_CLEANING` → `READY_TO_LEASE`

### `PUT /api/admin/readiness/units/:id`
Updates turnaround step completion checkboxes:
* **Request Body:** `{ stage: string, cleaningComplete?: boolean, paintComplete?: boolean, repairComplete?: boolean, notes?: string }`

---

## 6. Tenants & Vehicles (`/api/admin/tenants` & `/api/admin/vehicles`)

### `GET /api/admin/tenants`
Returns tenants directory with active unit number, balance due, and lease validity.
* **Query Params:** `?search=john&status=ACTIVE`

### `POST /api/admin/tenants`
Onboards a new tenant record.
* **Request Body (Zod):**
  ```typescript
  z.object({
    companyId: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    emergencyContact: z.string().optional()
  })
  ```

### `GET /api/admin/tenants/:id`
Comprehensive tenant ledger: contact info, active leases, invoices, payment history, and registered vehicles.

### `GET /api/admin/vehicles`
Lists registered tenant parking permits.
* **Response (200 OK):** Array of vehicles with license plates, tenant name, and assigned unit.

### `POST /api/admin/vehicles`
Registers tenant parking vehicle permit.
* **Request Body:** `{ tenantId: string, unitId: string, make: string, model: string, licensePlate: string, permitNumber?: string }`

---

## 7. Leases & Renewals (`/api/admin/leases`)

### `GET /api/admin/leases`
Lists all active, expiring, and terminated leases.
* **Query Params:** `?status=ACTIVE&expiringWithinDays=60`

### `POST /api/admin/leases`
Executes a new lease contract binding a tenant to a unit.
* **Request Body (Zod):**
  ```typescript
  z.object({
    unitId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    rentAmount: z.number().positive(),
    depositAmount: z.number().min(0)
  })
  ```

### `GET /api/admin/leases/renewals`
Returns leases requiring renewal notices or pending tenant signature.

### `POST /api/admin/leases/:id/renew`
Issues formal lease renewal terms with proposed rent increase percentage.

---

## 8. Billing, Invoices & Rent Collection (`/api/admin/invoices` & `/api/admin/payments`)

### `GET /api/admin/invoices`
Returns all monthly rent bills, utility charges, and arrears.
* **Query Params:** `?status=UNPAID&dueDateBefore=2026-11-01`

### `POST /api/admin/invoices`
Generates recurring monthly rent invoice batch across all active leases.

### `GET /api/admin/payments-received`
Master ledger of all recorded inflows with payment methods and timestamps.

### `POST /api/admin/payments` (Single Place to Collect Rent)
Records incoming rent transaction, settles invoice balance, and credits bank account.
* **Auth / RBAC:** `SUPER_ADMIN`, `COMPANY_ADMIN`, `PROPERTY_MANAGER`, `ACCOUNTANT`
* **Request Body (Zod Schema):**
  ```typescript
  z.object({
    invoiceId: z.string().uuid().optional(),
    tenantId: z.string().uuid(),
    bankAccountId: z.string().uuid(),
    amount: z.number().positive(),
    paymentMethod: z.enum([
      'INTERAC_E_TRANSFER',
      'CREDIT_CARD',
      'PRE_AUTHORIZED_DEBIT',
      'BANK_TRANSFER',
      'CHEQUE',
      'CASH'
    ]),
    referenceId: z.string().optional()
  })
  ```
* **Effects:**
  1. Creates `Payment` record.
  2. Updates `Invoice.amountPaid` and flips status to `PAID` or `PARTIALLY_PAID`.
  3. Increments `BankAccount.balance`.
  4. Creates immutable `AuditLog`.

### `GET /api/admin/outstanding-dues`
Returns delinquent tenant balances sorted by days overdue (30/60/90+ days).

### `GET /api/admin/accounts` & `POST /api/admin/accounts`
Lists and registers corporate bank accounts (Operating, Trust, Reserve).

---

## 9. Maintenance & Work Orders (`/api/admin/maintenance` & `/api/admin/tickets`)

### `GET /api/admin/tickets`
Fetches maintenance tickets.
* **Query Params:** `?propertyId=uuid&priority=EMERGENCY&status=SUBMITTED`

### `POST /api/admin/tickets`
Creates a work order ticket with optional photo attachments.
* **Request Body:** `{ propertyId: string, unitId: string, tenantId?: string, title: string, description: string, priority: string }`

### `PUT /api/admin/tickets/:id/status`
Updates ticket progression (`SUBMITTED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).

### `PUT /api/admin/tickets/:id/assign`
Dispatches ticket to a specific maintenance staff member.

---

## 10. Legal Cases (Quebec TAL Tribunal) (`/api/admin/tal-cases`)

### `GET /api/admin/tal-cases`
Returns all legal tribunal files with claim amounts and next hearing dates.

### `POST /api/admin/tal-cases`
Files a new legal case dossier.
* **Request Body:** `{ propertyId: string, unitId: string, tenantId: string, docketNumber: string, filingDate: string, amountClaimed: number }`

### `GET /api/admin/tal-cases/:id`
Retrieves full legal dossier: court dates, attached evidentiary PDFs, notices, and judge rulings.

### `POST /api/admin/tal-cases/:id/hearings`
Schedules an upcoming tribunal court hearing.

---

## 11. Communications & Notifications (`/api/communication`)

### `GET /api/communication/conversations`
Returns chat/message threads grouped by tenant.

### `POST /api/communication/send`
Sends direct transactional SMS or Email notice to tenant.
* **Request Body:** `{ recipientId: string, channel: 'EMAIL' | 'SMS', subject?: string, message: string }`

### `POST /api/communication/campaigns`
Broadcasts building-wide notices (e.g., water shutoff, snow removal alerts).

---

## 12. Analytics & KPI Dashboards (`/api/admin/analytics`)

### `GET /api/admin/dashboard/stats`
Executive overview KPI metrics:
* Total Properties & Units
* Real-time Occupancy % & Vacancy Rate
* Total Monthly Rent Billed vs Collected
* Critical Lease Alerts (Expiring in 30/60 days)
* Open Emergency Maintenance Tickets

### `GET /api/admin/analytics/revenue`
12-month rolling cash-flow trajectory (Revenue, Net Operating Income, Arrears).

### `GET /api/admin/analytics/vacancy`
Historical vacancy rate trends broken down by building and unit type.

