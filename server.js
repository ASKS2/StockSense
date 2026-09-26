// ============================================================
// StockSense API - Server Entry Point
// Merged & wired up by: Member 2 (Dashboard & Infra)
// ------------------------------------------------------------
// Mounts every teammate's routes under /api/*. See README.md
// for the full API reference and setup instructions.
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const productRoutes = require("./routes/products");
const receiptRoutes = require("./routes/receipts");
const deliveryRoutes = require("./routes/deliveries");
const transferRoutes = require("./routes/transfers");
const adjustmentRoutes = require("./routes/adjustments");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed a demo login so the app is usable the moment it starts.
function seedDemoUser() {
  if (!User.findByEmail("admin@stocksense.com")) {
    User.create({
      id: "user-demo-admin",
      name: "Demo Admin",
      email: "admin@stocksense.com",
      role: "Inventory Manager",
      passwordHash: bcrypt.hashSync("admin123", 10),
      createdAt: new Date().toISOString(),
    });
    console.log("[StockSense] Seeded demo login -> admin@stocksense.com / admin123");
  }
}
seedDemoUser();

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "StockSense API" }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StockSense API running on http://localhost:${PORT}`);
});
