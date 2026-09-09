# Mini ERP + CRM — Frontend

React + TypeScript + Vite admin UI for the Mini ERP/CRM Operations Portal.

See the [root README](../README.md) for full setup, environment variable, and deployment instructions.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173` and expects the backend API at the URL set in `VITE_API_BASE_URL`.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Structure

```
src/
├── components/   Layout, route guard, modal, status badge
├── pages/        Login, Dashboard, Customers, Customer detail, Products, Challans
├── services/     Axios API client
├── App.tsx       Route definitions
└── main.tsx      App entry point
```
