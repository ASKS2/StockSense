// ============================================================
// Module: Product Management
// Contributor: Member 3 (Products & Receipts)
// ============================================================

const { readCollection, writeCollection } = require("../config/db");

const COLLECTION = "products";

function all() {
  return readCollection(COLLECTION);
}

function findById(id) {
  return all().find((p) => p.id === id);
}

function findBySku(sku) {
  return all().find((p) => p.sku.toLowerCase() === sku.toLowerCase());
}

function create(product) {
  const products = all();
  products.push(product);
  writeCollection(COLLECTION, products);
  return product;
}

function update(id, updates) {
  const products = all();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  writeCollection(COLLECTION, products);
  return products[idx];
}

// Adjust stock for a product at a specific warehouse by a delta
// (positive to add stock, negative to remove). Used by receipts,
// deliveries, transfers and adjustments so stock math lives in one place.
function adjustStock(id, warehouseId, delta) {
  const products = all();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const current = products[idx].stock[warehouseId] || 0;
  products[idx].stock[warehouseId] = current + delta;
  writeCollection(COLLECTION, products);
  return products[idx];
}

function totalStock(product) {
  return Object.values(product.stock).reduce((sum, n) => sum + n, 0);
}

function remove(id) {
  const products = all().filter((p) => p.id !== id);
  writeCollection(COLLECTION, products);
}

module.exports = {
  all,
  findById,
  findBySku,
  create,
  update,
  adjustStock,
  totalStock,
  remove,
};
