// ============================================================
// Module: Stock Adjustments
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ------------------------------------------------------------
// Reconciles recorded stock against a physical count. The
// system computes the delta and logs it automatically.
//
// Endpoints:
//   GET   /api/adjustments
//   POST  /api/adjustments  -> { productId, warehouseId, countedQuantity, reason }
// ============================================================

const express = require("express");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middleware/auth");
const Adjustment = require("../models/Adjustment");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.json(Adjustment.all().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post("/", requireAuth, (req, res) => {
  const { productId, warehouseId, countedQuantity, reason } = req.body;

  const product = Product.findById(productId);
  if (!product || !warehouseId || countedQuantity === undefined) {
    return res.status(400).json({ message: "Product, warehouse and counted quantity are required." });
  }

  const recorded = product.stock[warehouseId] || 0;
  const delta = Number(countedQuantity) - recorded;

  Product.adjustStock(productId, warehouseId, delta);

  const adjustment = Adjustment.create({
    id: `adj-${nanoid(8)}`,
    docNumber: `ADJ-${Date.now().toString().slice(-6)}`,
    productId,
    warehouseId,
    recordedQuantity: recorded,
    countedQuantity: Number(countedQuantity),
    delta,
    reason: reason || "Physical count reconciliation",
    status: "Done",
    createdBy: req.user.name,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(adjustment);
});

module.exports = router;
