// ============================================================
// Module: Dashboard
// Contributor: Member 2 (Dashboard & Infra)
// ------------------------------------------------------------
// Endpoints:
//   GET /api/dashboard/kpis
//   GET /api/dashboard/documents?type=&status=&warehouse=&category=
// ============================================================

const express = require("express");
const { requireAuth } = require("../middleware/auth");

const Product = require("../models/Product");
const Receipt = require("../models/Receipt");
const Delivery = require("../models/Delivery");
const Transfer = require("../models/Transfer");
const Adjustment = require("../models/Adjustment");
const Warehouse = require("../models/Warehouse");

const router = express.Router();

router.get("/kpis", requireAuth, (req, res) => {
  const products = Product.all();
  const receipts = Receipt.all();
  const deliveries = Delivery.all();
  const transfers = Transfer.all();

  const lowStock = products.filter(
    (p) => Product.totalStock(p) > 0 && Product.totalStock(p) <= p.reorderLevel
  );
  const outOfStock = products.filter((p) => Product.totalStock(p) === 0);

  res.json({
    totalProducts: products.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    pendingReceipts: receipts.filter((r) => r.status !== "Done" && r.status !== "Cancelled").length,
    pendingDeliveries: deliveries.filter((d) => d.status !== "Done" && d.status !== "Cancelled").length,
    scheduledTransfers: transfers.filter((t) => t.status !== "Done" && t.status !== "Cancelled").length,
    lowStockItems: lowStock.map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: Product.totalStock(p) })),
    outOfStockItems: outOfStock.map((p) => ({ id: p.id, name: p.name, sku: p.sku })),
  });
});

// Combined, filterable document feed across all operation types —
// backs the "Dynamic Filters" section of the dashboard.
router.get("/documents", requireAuth, (req, res) => {
  const { type, status, warehouse, category } = req.query;

  let docs = [
    ...Receipt.all().map((d) => ({ ...d, type: "Receipt" })),
    ...Delivery.all().map((d) => ({ ...d, type: "Delivery" })),
    ...Transfer.all().map((d) => ({ ...d, type: "Internal" })),
    ...Adjustment.all().map((d) => ({ ...d, type: "Adjustment" })),
  ];

  if (type) docs = docs.filter((d) => d.type.toLowerCase() === String(type).toLowerCase());
  if (status) docs = docs.filter((d) => d.status.toLowerCase() === String(status).toLowerCase());
  if (warehouse) docs = docs.filter((d) => d.warehouseId === warehouse || d.sourceWarehouseId === warehouse || d.destWarehouseId === warehouse);
  if (category) {
    const products = Product.all();
    docs = docs.filter((d) =>
      (d.lines || []).some((line) => {
        const p = products.find((prod) => prod.id === line.productId);
        return p && p.category.toLowerCase() === String(category).toLowerCase();
      })
    );
  }

  docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(docs);
});

router.get("/warehouses", requireAuth, (req, res) => {
  res.json(Warehouse.all());
});

router.post("/warehouses", requireAuth, (req, res) => {
  const { name, location } = req.body;
  if (!name) return res.status(400).json({ message: "Warehouse name is required." });
  const warehouse = Warehouse.create({ id: `wh-${Date.now()}`, name, location: location || "" });
  res.status(201).json(warehouse);
});

module.exports = router;
