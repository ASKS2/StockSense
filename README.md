# StockSense

StockSense is an inventory management system built to replace the usual mess of paper registers, WhatsApp updates, and half-updated Excel sheets that most small and mid-size businesses rely on. It gives inventory managers and warehouse staff one place to see exactly how much stock they have, where it is, and what's moving in or out.

Built for a hackathon by a 4-person team.

## What it does

- **Auth** — sign up, log in, and reset your password with an OTP
- **Dashboard** — live counts of total products, low/out-of-stock items, and pending documents, plus a feed of recent activity you can filter by type, status, warehouse, or category
- **Products** — add products with a SKU, category, unit of measure, and reorder level, and track stock per warehouse
- **Receipts** — log stock coming in from suppliers; validating a receipt adds the stock automatically
- **Delivery orders** — pick, pack, and validate outgoing shipments; validating removes the stock automatically
- **Internal transfers** — move stock between warehouses or racks without changing the total count
- **Stock adjustments** — reconcile a physical count against what's on record, with the difference logged automatically
- **Settings** — manage the warehouses used across the app

Every action that changes stock gets logged, so there's always a record of what happened and when.

## Tech stack

- **Backend:** Node.js + Express, JWT authentication, bcrypt for password hashing, and a simple JSON-file data store (easy to swap for a real database later without touching the route logic)
- **Frontend:** Plain HTML, CSS, and JavaScript — no build step, no framework overhead
- **Auth:** JWT bearer tokens, with OTP-based password reset (in this demo the OTP shows up in the API response and server console instead of an actual email, since there's no email provider wired up)

## Project structure

```
StockSense/
├── backend/
│   ├── config/db.js       # JSON-file data layer
│   ├── models/            # One file per entity
│   ├── routes/            # One Express router per module
│   ├── middleware/auth.js # JWT guard
│   ├── utils/otp.js       # OTP generation/verification
│   ├── data/              # JSON data files, seeded with demo data
│   └── server.js
├── frontend/
│   ├── index.html         # Login
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
│   ├── css/style.css
│   └── js/
├── .gitignore
├── LICENSE
└── README.md
```

## Running it locally

**Backend**

```bash
cd backend
npm install
cp .env.example .env
npm start
```

This starts the API at `http://localhost:5000` and seeds a demo login the first time it runs:

```
Email:    admin@stocksense.com
Password: admin123
```

**Frontend**

No build step needed. Open `frontend/index.html` with a simple local server — for example, VS Code's Live Server extension, or:

```bash
cd frontend
python3 -m http.server 5500
```

Then visit `http://localhost:5500`. Make sure the backend is running first, since the frontend talks to it at `http://localhost:5000/api`.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/auth/forgot-password` | Request an OTP |
| POST | `/api/auth/reset-password` | Verify OTP and set a new password |
| GET/PUT | `/api/auth/me` | View or update your profile |
| GET | `/api/dashboard/kpis` | Dashboard summary numbers |
| GET | `/api/dashboard/documents` | Filterable feed of all operations |
| GET/POST | `/api/dashboard/warehouses` | List or add warehouses |
| GET/POST | `/api/products` | List or create products |
| GET/POST | `/api/receipts` (+ `/:id/validate`) | Incoming stock |
| GET/POST | `/api/deliveries` (+ `/:id/ready`, `/:id/validate`) | Outgoing stock |
| GET/POST | `/api/transfers` (+ `/:id/validate`) | Stock moves between warehouses |
| GET/POST | `/api/adjustments` | Physical count reconciliation |

Every route except `/api/auth/*` and `/api/health` expects an `Authorization: Bearer <token>` header.

## Team

Built by a 4-person team, each owning a module end to end:

- Auth & profile
- Dashboard & shared infrastructure
- Products & receipts
- Delivery orders, transfers & adjustments

## What's next

- Real email/SMS delivery for OTPs
- Barcode/QR scanning for faster picking and counting
- Role-based permissions for managers vs. staff
- Moving from JSON files to a proper database (MongoDB/Postgres)
- Basic analytics — stock turnover, demand trends

## License

MIT — see [LICENSE](LICENSE).
