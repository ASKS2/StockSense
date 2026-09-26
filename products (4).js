// ============================================================
// Module: Product Management
// Contributor: Member 3 (Products & Receipts)
// ------------------------------------------------------------
// Endpoints:
//   GET    /api/products
//   GET    /api/products/:id
//   POST   /api/products
//   PUT    /api/products/:id
//   DELETE /api/products/:id
// ============================================================

const express = require("express");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middleware/auth");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const { q, category } = req.query;
  let products = Product.all();

  if (q) {
    const term = q.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }
  if (category) {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  res.json(products.map((p) => ({ ...p, totalStock: Product.totalStock(p) })));
});

router.get("/:id", requireAuth, (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ ...product, totalStock: Product.totalStock(product) });
});

router.post("/", requireAuth, (req, res) => {
  const { name, sku, category, unit, reorderLevel, initialStock, warehouseId } = req.body;

  if (!name || !sku || !unit) {
    return res.status(400).json({ message: "Name, SKU and unit of measure are required." });
  }
  if (Product.findBySku(sku)) {
    return res.status(409).json({ message: "A product with this SKU already exists." });
  }

  const stock = {};
  Warehouse.all().forEach((w) => (stock[w.id] = 0));
  if (initialStock && warehouseId) {
    stock[warehouseId] = Number(initialStock);
  }

  const product = Product.create({
    id: `prod-${nanoid(8)}`,
    name,
    sku,
    category: category || "Uncategorized",
    unit,
    reorderLevel: Number(reorderLevel) || 0,
    stock,
  });

  res.status(201).json(product);
});

router.put("/:id", requireAuth, (req, res) => {
  const { name, category, unit, reorderLevel } = req.body;
  const updated = Product.update(req.params.id, {
    ...(name && { name }),
    ...(category && { category }),
    ...(unit && { unit }),
    ...(reorderLevel !== undefined && { reorderLevel: Number(reorderLevel) }),
  });
  if (!updated) return res.status(404).json({ message: "Product not found." });
  res.json(updated);
});

router.delete("/:id", requireAuth, (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  Product.remove(req.params.id);
  res.json({ message: "Product deleted." });
});

module.exports = router;
