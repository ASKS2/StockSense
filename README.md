# 📦 StockSense

**A modular Inventory Management System (IMS) that replaces manual registers,
Excel sheets and scattered tracking with one centralized, real-time app.**

Built in a hackathon by a 4-person team — see [Team & Modules](#-team--modules) below.

---

## ✨ Why StockSense

Most small and mid-size businesses still track stock across notebooks, WhatsApp
messages and half-updated spreadsheets. StockSense gives Inventory Managers and
Warehouse Staff a single source of truth: one dashboard, one ledger, one
number for "how much stock do we actually have?"

## 🧩 Core Features

| Module | What it does |
|---|---|
| **Auth** | Sign up / log in, OTP-based password reset |
| **Dashboard** | Live KPIs (total products, low/out of stock, pending docs) + a filterable operations feed |
| **Products** | Create products with SKU, category, unit of measure, reorder level, per-warehouse stock |
| **Receipts** | Record incoming stock from suppliers → validating a receipt increases stock automatically |
| **Delivery Orders** | Pick → Pack → Validate outgoing stock for customer shipments → stock decreases automatically |
| **Internal Transfers** | Move stock between warehouses/racks/floors — total stock stays the same, only location changes |
| **Stock Adjustments** | Reconcile a physical count against recorded stock; the system computes and logs the delta |
| **Settings** | Manage warehouses/locations used across every module |

Every stock-changing action is logged, so nothing moves without a trace —
exactly like the "Stock Ledger" in the original problem statement.

## 🛠 Tech Stack

- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing, JSON-file storage (zero external DB needed — swap in MongoDB/Postgres later without touching route logic)
- **Frontend:** Vanilla HTML/CSS/JS (no build step — open and run), `fetch`-based API client
- **Auth:** JWT bearer tokens, OTP-based password reset (demo mode logs the OTP to the server console / API response)

## 📁 Folder Structure

```
StockSense/
├── backend/
│   ├── config/db.js          # JSON-file data layer
│   ├── models/                # One file per entity (User, Product, Receipt, ...)
│   ├── routes/                # Express routers, one per module
│   ├── middleware/auth.js     # JWT guard
│   ├── utils/otp.js           # OTP generate/verify
│   ├── data/                  # JSON "database" files (seeded with demo data)
│   └── server.js              # App entry point
├── frontend/
│   ├── index.html             # Login
│   ├── signup.html
│   ├── forgot-password.html
│   ├── dashboard.html
│   ├── products.html
│   ├── receipts.html
│   ├── deliveries.html
│   ├── transfers.html
│   ├── adjustments.html
│   ├── settings.html
│   ├── profile.html
│   ├── css/style.css          # Shared design system
│   └── js/                    # One file per page/module + shared api.js, layout.js
├── docs/
│   └── CONTRIBUTORS.md        # Who built what
├── setup-git-history.sh       # Recreates commit history with each teammate as author
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The API runs at `http://localhost:5000`. On first run it seeds a demo login:

```
Email:    admin@stocksense.com
Password: admin123
```

### 2. Frontend

No build tools required — it's plain HTML/CSS/JS. Easiest options:

- **VS Code + Live Server extension**: right-click `frontend/index.html` → "Open with Live Server"
- **Python's built-in server**:
  ```bash
  cd frontend
  python3 -m http.server 5500
  ```
  then open `http://localhost:5500`

Make sure the backend is running first — the frontend calls
`http://localhost:5000/api` (see `frontend/js/api.js` if you need to change the port).

### 3. Try the flow

1. Log in with the demo account (or sign up as a new user)
2. Add a product or two in **Products**
3. Create a **Receipt** from a supplier, then hit **Validate** → watch stock go up
4. Create a **Delivery Order**, mark it picked/packed, validate it → watch stock go down
5. Move stock between warehouses in **Internal Transfers**
6. Reconcile a physical count in **Stock Adjustments**
7. Check the **Dashboard** — KPIs and the operations feed update live

## 📡 API Reference (summary)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, returns JWT |
| POST | `/api/auth/forgot-password` | Sends OTP |
| POST | `/api/auth/reset-password` | Verifies OTP, sets new password |
| GET/PUT | `/api/auth/me` | View/update profile |
| GET | `/api/dashboard/kpis` | Dashboard KPI numbers |
| GET | `/api/dashboard/documents` | Filterable feed of all operations |
| GET/POST | `/api/dashboard/warehouses` | List/add warehouses |
| GET/POST | `/api/products` | List/create products |
| GET/POST | `/api/receipts` + `/:id/validate` | Incoming stock |
| GET/POST | `/api/deliveries` + `/:id/ready`, `/:id/validate` | Outgoing stock |
| GET/POST | `/api/transfers` + `/:id/validate` | Internal stock moves |
| GET/POST | `/api/adjustments` | Physical count reconciliation |

All routes except `/api/auth/*` and `/api/health` require an
`Authorization: Bearer <token>` header.

## 👥 Team & Modules

This repo is split so each teammate owns a clear vertical slice — update the
names below with your real team:

| Member | Owns | Files |
|---|---|---|
| **Member 1** | Auth & Profile | `routes/auth.js`, `middleware/auth.js`, `utils/otp.js`, `models/User.js`, `index.html`, `signup.html`, `forgot-password.html`, `profile.html`, `js/auth.js`, `js/profile.js` |
| **Member 2** | Dashboard & Infra | `server.js`, `config/db.js`, `routes/dashboard.js`, `models/Warehouse.js`, `dashboard.html`, `settings.html`, `css/style.css`, `js/api.js`, `js/layout.js`, `js/dashboard.js`, `js/settings.js` |
| **Member 3** | Products & Receipts | `routes/products.js`, `routes/receipts.js`, `models/Product.js`, `models/Receipt.js`, `products.html`, `receipts.html`, `js/products.js`, `js/receipts.js` |
| **Member 4** | Deliveries, Transfers & Adjustments | `routes/deliveries.js`, `routes/transfers.js`, `routes/adjustments.js`, `models/Delivery.js`, `models/Transfer.js`, `models/Adjustment.js`, `deliveries.html`, `transfers.html`, `adjustments.html`, `js/deliveries.js`, `js/transfers.js`, `js/adjustments.js` |

See [`docs/CONTRIBUTORS.md`](docs/CONTRIBUTORS.md) for more, and
`setup-git-history.sh` to generate a commit history that credits each member.

## 🔮 Future Scope

- Real email/SMS delivery for OTPs (currently logged to console for the demo)
- Barcode/QR scanning for faster picking and counting
- Role-based permissions (Manager vs Staff) enforced server-side
- Move from JSON-file storage to MongoDB/Postgres for production use
- Analytics: stock turnover rate, demand forecasting

## 📄 License

MIT — see [LICENSE](LICENSE).
