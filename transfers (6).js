// ============================================================
// Module: Internal Transfers
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ------------------------------------------------------------
// Endpoints:
//   GET   /api/transfers
//   POST  /api/transfers               -> moves stock between warehouses
//   POST  /api/transfers/:id/validate  -> marks the move Done
// ============================================================

const express = require("express");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middleware/auth");
const Transfer = require("../models/Transfer");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.json(Transfer.all().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post("/", requireAuth, (req, res) => {
  const { sourceWarehouseId, destWarehouseId, lines } = req.body;

  if (!sourceWarehouseId || !destWarehouseId || sourceWarehouseId === destWarehouseId) {
    return res.status(400).json({ message: "Source and destination warehouses must be different." });
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: "At least one line item is required." });
  }

  for (const line of lines) {
    const product = Product.findById(line.productId);
    const available = product ? product.stock[sourceWarehouseId] || 0 : 0;
    if (!product || available < Number(line.quantity)) {
      return res.status(400).json({
        message: `Not enough stock for "${product ? product.name : line.productId}" at the source warehouse.`,
      });
    }
  }

  const transfer = Transfer.create({
    id: `transfer-${nanoid(8)}`,
    docNumber: `INT-${Date.now().toString().slice(-6)}`,
    sourceWarehouseId,
    destWarehouseId,
    lines,
    status: "Draft",
    createdBy: req.user.name,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(transfer);
});

router.post("/:id/validate", requireAuth, (req, res) => {
  const transfer = Transfer.findById(req.params.id);
  if (!transfer) return res.status(404).json({ message: "Transfer not found." });
  if (transfer.status === "Done") {
    return res.status(400).json({ message: "Transfer already validated." });
  }

  transfer.lines.forEach((line) => {
    // Total stock across the company is unchanged — only the location moves.
    Product.adjustStock(line.productId, transfer.sourceWarehouseId, -Number(line.quantity));
    Product.adjustStock(line.productId, transfer.destWarehouseId, Number(line.quantity));
  });

  const updated = Transfer.update(transfer.id, {
    status: "Done",
    validatedAt: new Date().toISOString(),
  });

  res.json(updated);
});

module.exports = router;
