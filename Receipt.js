// ============================================================
// Module: Receipts (Incoming Stock)
// Contributor: Member 3 (Products & Receipts)
// ============================================================

const { readCollection, writeCollection } = require("../config/db");

const COLLECTION = "receipts";

function all() {
  return readCollection(COLLECTION);
}

function findById(id) {
  return all().find((r) => r.id === id);
}

function create(receipt) {
  const receipts = all();
  receipts.push(receipt);
  writeCollection(COLLECTION, receipts);
  return receipt;
}

function update(id, updates) {
  const receipts = all();
  const idx = receipts.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  receipts[idx] = { ...receipts[idx], ...updates };
  writeCollection(COLLECTION, receipts);
  return receipts[idx];
}

module.exports = { all, findById, create, update };
