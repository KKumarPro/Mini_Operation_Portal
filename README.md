# Mini ERP + CRM Operations Portal

A full-stack **Mini ERP + CRM Operations Portal** for a wholesale/distribution business. The application centralizes customer CRM, product and inventory management, stock movements, and sales challans behind a JWT-based role system.

This project was built as a full-stack case-study assignment with a React frontend, Node.js/Express backend, PostgreSQL database, REST APIs, validation, role-based authorization, and free-tier cloud deployment.

---

## Live Application

| Component | URL |
|---|---|
| Frontend | https://mini-operation-portal.vercel.app |
| Backend API | https://mini-operation-portal-backend.onrender.com |
| Backend Health Check | https://mini-operation-portal-backend.onrender.com/api/health |
| GitHub Repository | https://github.com/KKumarPro/Mini_Operation_Portal |

The frontend is deployed on **Vercel**, the backend is deployed on **Render**, and PostgreSQL is hosted using **Neon**.

---

## Assignment Scope

The application covers the core business flow required for the case study:

1. Authentication and role-based access
2. Customer CRM
3. Product and inventory management
4. Stock movement tracking
5. Sales challan creation and management
6. REST API validation and error handling
7. Pagination, search, and filters
8. PostgreSQL persistence
9. Responsive admin-style frontend
10. Free-tier production deployment

The original assignment specifies four roles: **Admin, Sales, Warehouse, and Accounts**, plus customer, inventory, and sales-challan workflows. It also requires clean REST APIs with validation, HTTP status codes, error messages, pagination/search where appropriate, and deployment documentation.

---

# Features

## 1. Authentication & Role-Based Access

- JWT-based authentication.
- Passwords are stored as bcrypt hashes in the database.
- Four application roles:
  - `ADMIN`
  - `SALES`
  - `WAREHOUSE`
  - `ACCOUNTS`
- Protected frontend routes prevent unauthenticated users from opening application pages.
- Protected backend routes require a valid `Authorization: Bearer <token>` header.
- Role authorization is enforced on write operations.
- JWTs are configured with a 1-day expiration.
- Logout removes the locally stored authentication session.

### Login flow

```text
Open application
      |
      v
    /login
      |
      v
Enter email + password
      |
      v
POST /api/auth/login
      |
      v
Backend validates credentials
      |
      v
JWT + user information returned
      |
      v
Frontend stores session data
      |
      v
Protected application
```

---

## 2. Customer CRM

Customer records contain:

- Customer name
- Mobile number
- Email
- Business name
- Optional GST number
- Customer type
  - Retail
  - Wholesale
  - Distributor
- Address
- Status
  - Lead
  - Active
  - Inactive
- Follow-up date
- Notes
- Created/updated timestamps

### Customer functionality

- Add customer
- Edit customer
- Search customers
- Paginated customer listing
- Open customer detail page
- View customer profile information
- View customer challan history
- Add follow-up notes
- Set the next follow-up date

Follow-up notes are appended to the existing notes field with a timestamp, keeping the CRM implementation simple and aligned with the assignment scope.

---

## 3. Product & Inventory Management

Each product stores:

- Product name
- SKU/code
- Category
- Unit price
- Current stock
- Minimum stock alert quantity
- Warehouse/location
- Created/updated timestamps

### Product functionality

- Add product
- Edit product
- Search products
- Paginated product listing
- View product details
- Show low-stock status
- Record stock movement
- View complete stock movement history for a product

### Stock movement log

Every inventory movement records:

- Product
- Quantity
- Movement type: `IN` or `OUT`
- Reason
- User who created the movement
- Timestamp

### Stock safety

Stock changes are handled through controlled movement operations rather than direct editing of the current stock value. Outgoing stock cannot make inventory negative.

For confirmed sales, the backend performs a conditional stock decrement inside a database transaction so the operation fails atomically when available stock is insufficient.

---

## 4. Sales Challans

The Sales Challan module supports the main order-to-stock business flow.

### Challan features

- Select a customer
- Add multiple products to a challan
- Set quantity for each product
- Automatically generate a challan number
- Save as `DRAFT`
- Save directly as `CONFIRMED`
- Confirm an existing draft
- Cancel a draft
- Search challans
- Filter challans by status
- Paginate challan history
- Open challan details

### Challan statuses

| Status | Meaning |
|---|---|
| `DRAFT` | Saved but stock has not been deducted |
| `CONFIRMED` | Sale confirmed and stock deducted |
| `CANCELLED` | Draft cancelled without deduction |

### Confirmation business logic

When a challan is confirmed:

1. The customer is validated.
2. All referenced products are validated.
3. Available stock is checked.
4. The challan is created/updated inside a transaction.
5. Each challan item stores a product snapshot.
6. Stock is deducted.
7. `OUT` stock movements are created with the challan number as the reason.
8. If any item cannot be fulfilled, the transaction fails and the stock update is not partially committed.

### Product snapshot

Each `ChallanItem` stores:

- Product ID
- Product name at sale time
- SKU at sale time
- Unit price at sale time
- Quantity

This means the challan keeps the relevant sale-time product information even if the product is edited later.

---

# Role & Permission Matrix

| Feature | Admin | Sales | Warehouse | Accounts |
|---|:---:|:---:|:---:|:---:|
| Login | Yes | Yes | Yes | Yes |
| View Dashboard | Yes | Yes | Yes | Yes |
| View Customers | Yes | Yes | Yes | Yes |
| Create Customer | Yes | Yes | Yes | Yes |
| Edit Customer | Yes | Yes | Yes | Yes |
| Customer Follow-up | Yes | Yes | Yes | Yes |
| View Products | Yes | Yes | Yes | Yes |
| Create Product | Yes | No | Yes | No |
| Edit Product | Yes | No | Yes | No |
| Record Stock Movement | Yes | No | Yes | No |
| View Stock Movement History | Yes | Yes | Yes | Yes |
| View Challans | Yes | Yes | Yes | Yes |
| Create Challan | Yes | Yes | No | No |
| Confirm/Cancel Draft Challan | Yes | Yes | No | No |

The backend is the final authority for permissions; frontend navigation is not treated as the security boundary.

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- HTML/CSS

## Backend

- Node.js
- TypeScript
- Express.js
- REST APIs
- Zod validation
- JSON Web Token (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- CORS

## Database

- PostgreSQL
- Prisma ORM
- Prisma PostgreSQL adapter (`@prisma/adapter-pg`)
- Neon PostgreSQL for production

## Development / Deployment

- Git / GitHub
- Vercel — frontend deployment
- Render — backend deployment
- Neon — PostgreSQL database
- Postman — API testing/documentation

---

# High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │        Browser          │
                         │     React + Vite        │
                         └────────────┬────────────┘
                                      │
                              HTTP / REST / JWT
                                      │
                                      v
                         ┌─────────────────────────┐
                         │      Express API        │
                         │ Node.js + TypeScript    │
                         └────────────┬────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                v                     v                     v
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │ Auth / RBAC  │      │   Services   │      │  Validation  │
        │ JWT + Role   │      │ Business     │      │    Zod       │
        │ Middleware   │      │ Logic        │      │              │
        └──────────────┘      └──────┬───────┘      └──────────────┘
                                     │
                                     v
                            ┌─────────────────┐
                            │  Prisma ORM     │
                            │  PostgreSQL     │
                            └────────┬────────┘
                                     │
                                     v
                              ┌────────────┐
                              │ Neon DB    │
                              └────────────┘
```

---

# Project Structure

```text
Mini_Operation_Portal/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/              # Database migrations
│   │   ├── schema.prisma             # Prisma data model
│   │   └── seed.ts                    # Demo users / seed data
│   │
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validator.ts
│   │   │
│   │   ├── customers/
│   │   │   ├── customer.controller.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── customer.service.ts
│   │   │   └── customer.validator.ts
│   │   │
│   │   ├── products/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.validator.ts
│   │   │
│   │   ├── challans/
│   │   │   ├── challan.controller.ts
│   │   │   ├── challan.routes.ts
│   │   │   ├── challan.service.ts
│   │   │   └── challan.validator.ts
│   │   │
│   │   ├── config/
│   │   │   └── database.ts            # Prisma client configuration
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts      # Authentication + authorization
│   │   │   ├── errorHandler.ts        # Centralized API errors
│   │   │   └── notFound.ts             # 404 handling
│   │   │
│   │   ├── utils/
│   │   │   └── AppError.ts             # Application error class
│   │   │
│   │   ├── app.ts                      # Express application setup
│   │   └── server.ts                    # Database connection + server start
│   │
│   ├── prisma7.config.ts
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── Products.tsx
│   │   │   └── Challans.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                 # Axios API client
│   │   │
│   │   ├── App.tsx                    # Frontend routes
│   │   ├── App.css                    # Application styles
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── vite.config.ts
│
├── postman_collection.json             # API collection
└── README.md
```

---

# Database Design

The PostgreSQL schema contains the following main entities:

```text
User
 │
 ├─────────────── StockMovement
 │
 └─────────────── Challan
                       │
                       ├──────────── Customer
                       │
                       └──────────── ChallanItem ───────── Product
                                                        │
                                                        └── StockMovement
```

## Main tables

### User

- `id`
- `name`
- `email`
- `password`
- `role`
- `createdAt`
- `updatedAt`

### Customer

- `id`
- `name`
- `mobile`
- `email`
- `businessName`
- `gstNumber`
- `type`
- `address`
- `status`
- `followUpDate`
- `notes`
- timestamps

### Product

- `id`
- `name`
- `sku`
- `category`
- `unitPrice`
- `currentStock`
- `minStockAlert`
- `warehouse`
- timestamps

### StockMovement

- `id`
- `productId`
- `quantity`
- `type`
- `reason`
- `createdBy`
- `createdAt`

### Challan

- `id`
- `challanNumber`
- `customerId`
- `totalQuantity`
- `status`
- `createdBy`
- timestamps

### ChallanItem

- `id`
- `challanId`
- `productId`
- `productName`
- `sku`
- `unitPrice`
- `quantity`
- `createdAt`

---

# Prerequisites

Install the following before running the application locally:

- **Node.js 20+** recommended
- **npm**
- **PostgreSQL database**, either local PostgreSQL or a hosted PostgreSQL instance such as Neon
- **Git**
- **Postman** (optional, recommended for API testing)

Check Node and npm versions:

```bash
node --version
npm --version
```

---

# Installation & Local Setup

The repository contains two independent Node projects:

- `backend/`
- `frontend/`

Run the backend and frontend in separate terminals.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/KKumarPro/Mini_Operation_Portal.git
cd Mini_Operation_Portal
```

---

## Step 2 — Configure the Backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Create the backend environment file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux / Git Bash

```bash
cp .env.example .env
```

Open `backend/.env` and configure:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
```

### Environment variable explanation

| Variable | Required | Purpose |
|---|:---:|---|
| `PORT` | No | Express server port. Defaults to `5000` locally. |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT tokens. |

Never commit the real `.env` file or production secrets to GitHub.

---

## Step 3 — Prepare the Database

From `backend/`:

```bash
npx prisma migrate deploy
```

This applies the committed Prisma migrations to the configured PostgreSQL database.

The project uses Prisma's generated client. The normal project scripts also run Prisma generation during installation/build.

---

## Step 4 — Seed Demo Users

Run:

```bash
npm run seed
```

This creates or updates the four demo users used for the assignment.

Expected console output:

```text
Test users seeded successfully
```

---

## Step 5 — Start the Backend

Development mode:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

Health check:

```text
http://localhost:5000/api/health
```

Expected health response:

```json
{
  "success": true,
  "message": "Mini ERP + CRM API is running"
}
```

---

# Frontend Setup

Open a **second terminal** from the project root.

```bash
cd frontend
npm install
```

Create the frontend environment file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux / Git Bash

```bash
cp .env.example .env
```

For local development, `frontend/.env` should contain:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

The frontend normally opens at:

```text
http://localhost:5173
```

---

# Run the Full Application Locally

### Terminal 1 — Backend

```bash
cd Mini_Operation_Portal/backend
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

### Terminal 2 — Frontend

```bash
cd Mini_Operation_Portal/frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/login
```

---

# Demo Login Credentials

These credentials are created by the backend seed script.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mini-erp.com` | `Admin@123` |
| Sales | `sales@mini-erp.com` | `Sales@123` |
| Warehouse | `warehouse@mini-erp.com` | `Warehouse@123` |
| Accounts | `accounts@mini-erp.com` | `Accounts@123` |

These are **demo credentials for the assignment** and must be replaced with secure credentials in a real production system.

---

# Application Workflow

## Customer Workflow

```text
Login
  ↓
Customers
  ↓
Add Customer
  ↓
Customer List
  ↓
Search / Pagination
  ↓
Customer Detail
  ↓
Edit / Follow-up
```

## Inventory Workflow

```text
Login
  ↓
Products
  ↓
Add Product
  ↓
Record Stock IN
  ↓
Current Stock Updated
  ↓
Stock Movement Logged
  ↓
Optional Stock OUT
  ↓
Stock History Updated
```

## Sales Challan Workflow

```text
Select Customer
      ↓
Add Product 1 + Qty
      ↓
Add Product 2 + Qty
      ↓
Save Draft OR Confirm
      │
      ├── Draft ───────→ No stock deduction
      │                     ↓
      │                 Confirm later
      │
      └── Confirmed ──→ Validate stock
                            ↓
                       Deduct stock
                            ↓
                       Create OUT movement
                            ↓
                     Challan = CONFIRMED
```

---

# REST API Reference

All routes are prefixed with `/api`.

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate user and return JWT + user information |

### Login request

```json
{
  "email": "admin@mini-erp.com",
  "password": "Admin@123"
}
```

---

## Customers

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/customers` | Authenticated | Paginated/searchable customer list |
| POST | `/api/customers` | Authenticated | Create customer |
| GET | `/api/customers/:id` | Authenticated | Customer detail + challan history |
| PATCH | `/api/customers/:id` | Authenticated | Update customer |
| POST | `/api/customers/:id/follow-up` | Authenticated | Add follow-up note |

### Customer list query parameters

```text
?page=1&limit=10&search=abc
```

---

## Products

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/products` | Authenticated | Paginated/searchable product list |
| POST | `/api/products` | Admin, Warehouse | Create product |
| GET | `/api/products/:id` | Authenticated | Product detail |
| PATCH | `/api/products/:id` | Admin, Warehouse | Update product |
| POST | `/api/products/:id/stock` | Admin, Warehouse | Add stock IN/OUT movement |
| GET | `/api/products/:id/stock-movements` | Authenticated | Stock history |

### Product list query parameters

```text
?page=1&limit=10&search=phone
```

---

## Challans

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/challans` | Authenticated | Paginated challan list |
| POST | `/api/challans` | Admin, Sales | Create Draft or Confirmed challan |
| GET | `/api/challans/:id` | Authenticated | Challan detail |
| PATCH | `/api/challans/:id/status` | Admin, Sales | Confirm or cancel a draft |

### Challan list query parameters

```text
?page=1&limit=10&status=CONFIRMED&search=SC-
```

Supported statuses:

```text
DRAFT
CONFIRMED
CANCELLED
```

---

# Authentication Header

All protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Example with cURL:

```bash
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

# Validation & Error Handling

The API uses:

- Zod schemas for request validation
- Centralized application error handling
- Proper HTTP status codes
- Structured JSON error responses
- Authentication errors with `401`
- Authorization errors with `403`
- Missing resources with `404`
- Validation/business-rule errors with `400`
- Unexpected server failures with `500`

Typical validation response structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

A business-rule example is insufficient inventory during challan confirmation. The API returns an error rather than allowing stock to become negative.

---

# Postman Collection

The repository includes:

```text
postman_collection.json
```

Import it into Postman.

The collection contains:

- Auth
- Customers
- Products
- Challans
- Health Check

## Postman variables

| Variable | Purpose |
|---|---|
| `baseUrl` | API base URL |
| `token` | JWT authentication token |
| `customerId` | Customer ID used by later requests |
| `productId` | Product ID used by later requests |
| `challanId` | Challan ID used by later requests |

For local testing:

```text
baseUrl = http://localhost:5000/api
```

For production testing:

```text
baseUrl = https://mini-operation-portal-backend.onrender.com/api
```

Run **Login** first, then use the returned JWT for protected requests.

---

# Production Deployment

The project is currently deployed using free-tier services.

```text
React + Vite
     |
     | Vercel
     v
https://mini-operation-portal.vercel.app
     |
     | REST API
     v
Express + Node.js
     |
     | Render
     v
https://mini-operation-portal-backend.onrender.com
     |
     | Prisma
     v
PostgreSQL / Neon
```

## Production frontend

Platform: **Vercel**

Project/root directory:

```text
frontend/
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Environment variable:

```env
VITE_API_BASE_URL=https://mini-operation-portal-backend.onrender.com/api
```

## Production backend

Platform: **Render**

Project/root directory:

```text
backend/
```

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

Required environment variables:

```env
DATABASE_URL=<production PostgreSQL connection string>
JWT_SECRET=<strong production secret>
```

`PORT` can be supplied by the hosting platform; the server also defaults to port `5000` when run locally.

## Production database

The production database is PostgreSQL hosted on **Neon**.

The database connection string is supplied to the backend through:

```env
DATABASE_URL=...
```

Never expose the database connection string in source code or frontend variables.

---

# Production Deployment Checklist

1. Create the PostgreSQL database.
2. Configure `DATABASE_URL`.
3. Configure a strong `JWT_SECRET`.
4. Deploy `backend/` to Render.
5. Verify `/api/health`.
6. Apply Prisma migrations with `npx prisma migrate deploy`.
7. Run `npm run seed` once for demo users when required.
8. Deploy `frontend/` to Vercel.
9. Set `VITE_API_BASE_URL` to the production API.
10. Verify login for every role.
11. Verify customer CRUD and follow-ups.
12. Verify product CRUD and stock movements.
13. Verify draft/confirm/cancel challan flow.
14. Verify insufficient-stock protection.
15. Verify Postman collection against the production API.

---

# npm Scripts

## Backend

Run from `backend/`.

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start backend in development mode |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm run start` | Start compiled production server |
| `npm run seed` | Seed demo users |
| `npx prisma migrate deploy` | Apply committed migrations |

## Frontend

Run from `frontend/`.

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint |

---

# Frontend Pages

## Login

- Email/password form
- Backend authentication
- Error display
- Loading state
- Demo role reference

## Dashboard

Shows a high-level operational overview:

- Customer count
- Product count
- Sales challan count
- Low-stock alerts

## Customers

- Customer creation form
- Search
- Pagination
- Edit
- Status/type controls
- Customer detail navigation

## Customer Detail

- Full customer information
- Challan history
- Edit customer
- Follow-up note management
- Follow-up date

## Products

- Product creation
- Search
- Pagination
- Edit product
- Stock IN/OUT controls
- Low-stock indication
- Stock movement history

## Sales Challans

- Customer selection
- Multiple product rows
- Per-product quantity
- Save as Draft
- Confirm challan
- Search
- Status filter
- Pagination
- Confirm draft
- Cancel draft
- Challan detail view

---

# Security Considerations

The implementation includes the following security controls relevant to the case-study scope:

- JWT authentication
- Role-based authorization
- bcrypt password hashing
- Zod request validation
- Environment-based secrets
- Parameterized database access through Prisma
- Protected backend routes
- Centralized error handling
- No frontend secret/API key is used for database access

### Important production note

For a production enterprise application, this system should be extended with stronger controls such as refresh-token management, secure cookie-based authentication where appropriate, rate limiting, audit logging, stronger account lifecycle management, and more extensive automated testing.

---

# Data Consistency & Business Rules

## Rule 1 — Stock cannot become negative

The backend checks available stock before and during confirmed challan processing.

## Rule 2 — Draft challans do not deduct stock

A `DRAFT` challan stores the intended sale but leaves product stock unchanged.

## Rule 3 — Confirmed challans deduct stock

A `CONFIRMED` challan deducts stock and records `OUT` movements.

## Rule 4 — Only draft challans can change status

A draft can become `CONFIRMED` or `CANCELLED`.

A challan that is already confirmed or cancelled cannot be changed through the draft status endpoint.

## Rule 5 — Stock changes are logged

Manual inventory changes are represented as stock movements with a reason and the user who performed the operation.

## Rule 6 — Challan line items preserve snapshots

Product name, SKU, and unit price are copied into `ChallanItem` when the challan is created.

---

# Testing Guide

The project includes a Postman collection and supports manual end-to-end verification.

### Recommended test sequence

#### Authentication

- Login with Admin
- Login with Sales
- Login with Warehouse
- Login with Accounts
- Try protected API without a token
- Try a role-restricted API with the wrong role

#### Customers

- Create customer
- Search customer
- Open customer detail
- Edit customer
- Add follow-up note
- Verify pagination

#### Products

- Create product as Admin/Warehouse
- Search product
- Edit product
- Add stock IN
- Add stock OUT
- Attempt an excessive OUT movement
- Review movement history
- Verify low-stock indicator

#### Challans

- Create draft challan
- Create multi-product challan
- Confirm draft
- Cancel draft
- Confirm a challan with enough stock
- Attempt confirmation with insufficient stock
- Verify stock changes
- Verify `OUT` stock movements
- Search challans
- Filter by status
- Verify pagination
- Open challan details

---

# Known Limitations

The following items were intentionally left outside the core scope or are future improvements:

- No automated unit/integration test suite is included.
- No invoice generation/PDF export.
- No AWS S3 product-image upload.
- No Docker setup.
- No GitHub Actions CI/CD pipeline.
- No refresh-token implementation.
- No advanced reporting/analytics dashboard.
- No purchase-order or invoice module beyond the required challan workflow.
- CRM follow-up history is represented through the customer notes field rather than a dedicated follow-up table.

The assignment focuses on the required ERP/CRM workflows rather than a full enterprise ERP product.

---

# Future Enhancements

Possible next-stage features include:

- Invoice generation and PDF export
- Purchase orders
- Supplier/vendor management
- Dedicated CRM activity/follow-up table
- Audit logs
- Advanced sales and inventory reports
- Dashboard charts
- Product image uploads
- Docker containerization
- CI/CD with GitHub Actions
- Refresh-token/session management
- Email notifications
- Warehouse-level inventory segmentation
- Role-specific dashboards

---

# Assumptions

- A single JWT access token is sufficient for the assignment's authentication scope.
- Four seeded users represent the required employee roles.
- All roles can read core operational data; write access is restricted according to business responsibility.
- Direct product stock editing is intentionally avoided; inventory changes are recorded as movement transactions.
- Customer follow-ups are stored in the notes field with a timestamp instead of a separate activity entity.
- Challan confirmation is the point at which outgoing stock is deducted.

---

# Submission Deliverables

This repository contains the main items expected for the case study:

- GitHub source repository
- Live frontend URL
- Live backend API URL
- Test credentials for all required roles
- Postman API collection
- Environment-variable examples
- Database migration/schema
- Seed script
- Setup instructions
- Deployment instructions
- Architecture explanation
- Features and business rules
- Known limitations

---

# Quick Reference

## Production URLs

```text
Frontend:
https://mini-operation-portal.vercel.app

Backend:
https://mini-operation-portal-backend.onrender.com

Health:
https://mini-operation-portal-backend.onrender.com/api/health
```

## Local URLs

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000

API:
http://localhost:5000/api
```

## Demo Accounts

```text
Admin:
admin@mini-erp.com / Admin@123

Sales:
sales@mini-erp.com / Sales@123

Warehouse:
warehouse@mini-erp.com / Warehouse@123

Accounts:
accounts@mini-erp.com / Accounts@123
```

---

# License / Assignment Notice

This project was developed as a technical case-study/assignment implementation. It is intended to demonstrate full-stack development, API design, database modeling, authentication/authorization, business logic, frontend integration, and deployment practices.
