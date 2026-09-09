# Mini ERP + CRM Operations Portal

A role-based ERP + CRM web application built for managing customers, products, warehouse inventory, and sales challans.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Axios
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT Authentication
- Zod Validation
- bcryptjs

### Database
- PostgreSQL
- Neon PostgreSQL

## Core Modules

### Authentication & Roles
The application supports:
- Admin
- Sales
- Warehouse
- Accounts

JWT-based authentication is used for protected APIs.

### Customer CRM
- Add customer
- Edit customer
- Search customers
- Customer details
- Customer type
- Customer status
- Follow-up date
- Follow-up notes

### Product & Inventory
- Product management
- SKU
- Category
- Unit price
- Current stock
- Minimum stock alert
- Warehouse location
- Stock IN
- Stock OUT
- Stock movement history
- Negative stock prevention

### Sales Challans
- Create challans
- Draft / Confirmed / Cancelled status
- Automatic challan number
- Multiple products and quantities
- Product snapshot
- Automatic stock deduction on confirmation
- Insufficient stock validation

## Project Structure

```text
Mini_Operation_Portal/
├── backend/
│   ├── prisma/
│   └── src/
└── frontend/
    └── src/