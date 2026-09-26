// ============================================================
// Module: Delivery Orders (Outgoing Stock)
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ------------------------------------------------------------
// Endpoints:
//   GET   /api/deliveries
//   POST  /api/deliveries              -> create as Draft (Pick -> Pack)
//   POST  /api/deliveries/:id/validate -> decreases stock, status -> Done
// ============================================================

const express = require("express");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middleware/auth");
const Delivery = require("../models/Delivery");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.json(Delivery.all().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post("/", requireAuth, (req, res) => {
  const { customer, warehouseId, lines } = req.body;

  if (!customer || !warehouseId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: "Customer, warehouse and at least one line item are required." });
  }

  // Guard against promising stock we don't have.
  for (const line of lines) {
    const product = Product.findById(line.productId);
    const available = product ? product.stock[warehouseId] || 0 : 0;
    if (!product || available < Number(line.quantity)) {
      return res.status(400).json({
        message: `Not enough stock for "${product ? product.name : line.productId}" at this warehouse.`,
      });
    }
  }

  const delivery = Delivery.create({
    id: `delivery-${nanoid(8)}`,
    docNumber: `DEL-${Date.now().toString().slice(-6)}`,
    customer,
    warehouseId,
    lines, // [{ productId, quantity }]
    status: "Waiting", // Waiting -> Ready (picked/packed) -> Done (validated)
    createdBy: req.user.name,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(delivery);
});

router.post("/:id/ready", requireAuth, (req, res) => {
  const updated = Delivery.update(req.params.id, { status: "Ready" });
  if (!updated) return res.status(404).json({ message: "Delivery order not found." });
  res.json(updated);
});

router.post("/:id/validate", requireAuth, (req, res) => {
  const delivery = Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: "Delivery order not found." });
  if (delivery.status === "Done") {
    return res.status(400).json({ message: "Delivery already validated." });
  }

  delivery.lines.forEach((line) => {
    Product.adjustStock(line.productId, delivery.warehouseId, -Number(line.quantity));
  });

  const updated = Delivery.update(delivery.id, {
    status: "Done",
    validatedAt: new Date().toISOString(),
  });

  res.json(updated);
});

module.exports = router;
