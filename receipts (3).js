// ============================================================
// Module: Receipts (Incoming Stock)
// Contributor: Member 3 (Products & Receipts)
// ------------------------------------------------------------
// Endpoints:
//   GET   /api/receipts
//   POST  /api/receipts              -> create as Draft
//   POST  /api/receipts/:id/validate -> increases stock, status -> Done
// ============================================================

const express = require("express");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middleware/auth");
const Receipt = require("../models/Receipt");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.json(Receipt.all().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post("/", requireAuth, (req, res) => {
  const { supplier, warehouseId, lines } = req.body;

  if (!supplier || !warehouseId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: "Supplier, warehouse and at least one line item are required." });
  }

  const receipt = Receipt.create({
    id: `receipt-${nanoid(8)}`,
    docNumber: `RCP-${Date.now().toString().slice(-6)}`,
    supplier,
    warehouseId,
    lines, // [{ productId, quantity }]
    status: "Draft",
    createdBy: req.user.name,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(receipt);
});

router.post("/:id/validate", requireAuth, (req, res) => {
  const receipt = Receipt.findById(req.params.id);
  if (!receipt) return res.status(404).json({ message: "Receipt not found." });
  if (receipt.status === "Done") {
    return res.status(400).json({ message: "Receipt already validated." });
  }

  receipt.lines.forEach((line) => {
    Product.adjustStock(line.productId, receipt.warehouseId, Number(line.quantity));
  });

  const updated = Receipt.update(receipt.id, {
    status: "Done",
    validatedAt: new Date().toISOString(),
  });

  res.json(updated);
});

module.exports = router;
