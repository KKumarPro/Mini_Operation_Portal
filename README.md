# Mini ERP + CRM Operations Portal

A small ERP/CRM system for a wholesale/distribution company, built as a full-stack case study. It covers customers, products, stock, and sales challans, with role-based access for Admin, Sales, Warehouse, and Accounts users.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js, TypeScript, Express, Prisma ORM, PostgreSQL |
| Auth       | JWT (jsonwebtoken), bcryptjs |
| Validation | Zod |
| Frontend   | React, TypeScript, Vite, React Router, Axios |
| Database   | PostgreSQL (Neon, Supabase, or Render Postgres all work) |

## Modules & Features

### Authentication & Roles
- JWT login, 4 seeded roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
- Role-gated routes on product and challan write operations

### Customer CRM
- Add, edit, and search customers
- Customer detail page with full profile and challan history
- Add follow-up notes (appended to the customer's notes with a timestamp) and set the next follow-up date

### Products & Inventory
- Add and edit products
- Stock movement log: record IN/OUT movements with a reason, and view the full history per product
- Low-stock indicator based on the configured minimum stock alert

### Sales Challans
- Multi-product challans (add/remove line items)
- Save as **Draft** or **Confirmed**; draft challans can later be confirmed or cancelled
- Auto-generated challan numbers
- Product snapshot stored on each challan item (name, SKU, price at time of sale — not just a product reference)
- Stock is decremented only on confirmation, stock can never go negative, and insufficient stock returns a clear API error
- Pagination, status filter, and search on the challan list

### API
- REST APIs with Zod input validation, proper HTTP status codes, and structured error responses (including field-level validation errors)
- Pagination and search on customers, products, and challans

## Project Structure

```
Mini_Operation_Portal/
├── backend/
│   ├── prisma/            schema, migrations, seed script
│   └── src/
│       ├── auth/           login
│       ├── customers/      customer CRUD, follow-ups
│       ├── products/       product CRUD, stock movements
│       ├── challans/       challan creation, status updates
│       ├── middlewares/    auth, error handling, 404
│       └── config/         Prisma client
└── frontend/
    └── src/
        ├── components/     layout, route guard, modal, status badge
        ├── pages/           Login, Dashboard, Customers, Customer detail, Products, Challans
        └── services/        Axios API client
```

## Prerequisites

- Node.js 20+
- A PostgreSQL database (a free instance from [Neon](https://neon.tech) or [Supabase](https://supabase.com) works well)

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:

```
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="a long random string"
```

Run migrations and seed test users:

```bash
npx prisma migrate deploy
npm run seed
npm run dev
```

The API runs at `http://localhost:5000/api` (health check at `/api/health`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Edit `.env` if the backend runs somewhere other than `http://localhost:5000/api`. The app runs at `http://localhost:5173`.

### Test Credentials

Seeded by `npm run seed` in the backend:

| Role      | Email                    | Password       |
|-----------|---------------------------|----------------|
| Admin     | admin@mini-erp.com        | Admin@123      |
| Sales     | sales@mini-erp.com        | Sales@123      |
| Warehouse | warehouse@mini-erp.com    | Warehouse@123  |
| Accounts  | accounts@mini-erp.com     | Accounts@123   |

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `PORT` | backend | Port the Express server listens on (default 5000) |
| `DATABASE_URL` | backend | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | backend | Secret used to sign/verify JWTs — use a long random value |
| `VITE_API_BASE_URL` | frontend | Base URL the frontend calls for the API |

`.env` files are git-ignored on both sides; `.env.example` documents the required keys without real values.

## API Reference

A Postman collection is included at [`postman_collection.json`](./postman_collection.json) — import it into Postman, set the `baseUrl` and `token` collection variables, and it covers every endpoint below.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login, returns JWT + user | Public |
| GET | `/api/customers` | List customers (`page`, `limit`, `search`) | Any role |
| POST | `/api/customers` | Create customer | Any role |
| GET | `/api/customers/:id` | Customer detail + challan history | Any role |
| PATCH | `/api/customers/:id` | Update customer | Any role |
| POST | `/api/customers/:id/follow-up` | Add a follow-up note | Any role |
| GET | `/api/products` | List products (`page`, `limit`, `search`) | Any role |
| POST | `/api/products` | Create product | Admin, Warehouse |
| GET | `/api/products/:id` | Product detail | Any role |
| PATCH | `/api/products/:id` | Update product | Admin, Warehouse |
| POST | `/api/products/:id/stock` | Record a stock IN/OUT movement | Admin, Warehouse |
| GET | `/api/products/:id/stock-movements` | Stock movement log for a product | Any role |
| GET | `/api/challans` | List challans (`page`, `limit`, `status`, `search`) | Any role |
| POST | `/api/challans` | Create a challan (Draft or Confirmed) | Admin, Sales |
| GET | `/api/challans/:id` | Challan detail | Any role |
| PATCH | `/api/challans/:id/status` | Confirm or cancel a draft challan | Admin, Sales |

All authenticated routes expect `Authorization: Bearer <token>`. Validation errors return `400` with a `message` and an `errors[]` array of `{ field, message }`.

## Deployment

The app is not currently deployed. To deploy on free hosting:

1. **Database** — create a free Postgres instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com), copy the connection string into `DATABASE_URL`.
2. **Backend** — deploy the `backend/` folder to [Render](https://render.com) or [Railway](https://railway.app) as a Node web service:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Set `DATABASE_URL`, `JWT_SECRET`, and `PORT` as environment variables
   - Run `npx prisma migrate deploy` and `npm run seed` once (via the platform's shell/console) after the first deploy
3. **Frontend** — deploy the `frontend/` folder to [Vercel](https://vercel.com) or [Netlify](https://netlify.com):
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set `VITE_API_BASE_URL` to the deployed backend URL (e.g. `https://your-api.onrender.com/api`)
4. Update CORS on the backend if you restrict `cors()` to a specific origin.

## Architecture Notes

- **Layering**: each backend module (auth, customers, products, challans) follows `routes → controller → service`, with Zod validators per module and Prisma as the data layer. `AppError` + a shared `errorHandler` middleware turn both business errors and Zod validation errors into consistent JSON responses.
- **Stock safety**: stock decrements use a conditional `updateMany` (`currentStock >= quantity`) inside a Prisma transaction, so concurrent confirmations can't push stock negative — the operation fails atomically with a 400 instead of racing.
- **Challan snapshots**: each `ChallanItem` stores the product name, SKU, and unit price at the time of the sale, independent of later product edits.
- **Frontend**: plain React state + Axios (no global state library), one page per module, a shared `Modal` for edit/record forms, and role/user info read from the JWT payload stored in `localStorage`.

## Assumptions

- A single JWT (no refresh tokens) is sufficient for this assignment's scope; tokens expire after 1 day.
- "Edit" on products does not allow editing `currentStock` directly — stock changes always go through the stock movement endpoint so every change is logged with a reason.
- Follow-up notes are appended to the customer's `notes` field with a timestamp rather than stored as a separate table, since the case study lists "notes" as a single field on the customer.
- All four roles can read customers/products/challans; only Admin/Sales can create or update challans, and only Admin/Warehouse can create/update products, per the modules they own.

## Known Limitations

- No automated test suite (unit/integration tests) — out of scope for the assignment window.
- No invoice generation or PDF export (listed as a bonus, not implemented).
- No file/image upload for products (bonus, not implemented).
- No Docker setup or CI/CD pipeline (bonus, not implemented).
- Not deployed; run locally per the steps above.
