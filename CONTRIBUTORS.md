# Contributors

StockSense was built by a 4-person team for a hackathon. Each member owned an
end-to-end vertical slice (backend route + model + frontend page), so the
work could be built and demoed in parallel.

Replace the placeholder names below with your real teammates, then run
`../setup-git-history.sh` from the repo root to rewrite git history so each
commit is authored by the right person.

## Member 1 — Auth & Profile
- OTP-based signup/login/password reset (`backend/routes/auth.js`, `backend/utils/otp.js`)
- JWT auth middleware (`backend/middleware/auth.js`)
- Login, signup, forgot-password and profile pages

## Member 2 — Dashboard & Infra
- JSON-file data layer and server bootstrap (`backend/config/db.js`, `backend/server.js`)
- Dashboard KPIs and the filterable operations feed (`backend/routes/dashboard.js`)
- Shared design system, API client and app-shell layout used by every page
- Warehouse/settings management

## Member 3 — Products & Receipts
- Product catalog CRUD with per-warehouse stock (`backend/routes/products.js`)
- Incoming stock receipts with supplier + validate flow (`backend/routes/receipts.js`)
- Products and Receipts pages

## Member 4 — Deliveries, Transfers & Adjustments
- Delivery orders with pick/pack/validate flow (`backend/routes/deliveries.js`)
- Internal transfers between warehouses (`backend/routes/transfers.js`)
- Stock adjustments / physical count reconciliation (`backend/routes/adjustments.js`)
- Delivery, Transfer and Adjustment pages

---

### How the codebase stays modular

Every backend route only touches its own model file, and every model only
talks to the shared `config/db.js` data layer — so any two people can work on
different modules at once without touching each other's files. The only
shared frontend files are `css/style.css`, `js/api.js` and `js/layout.js`,
which is intentional: one small, stable "design system" layer that every
page builds on top of.
