// ============================================================
// Module: Internal Transfers
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ============================================================

const { readCollection, writeCollection } = require("../config/db");

const COLLECTION = "transfers";

function all() {
  return readCollection(COLLECTION);
}

function findById(id) {
  return all().find((r) => r.id === id);
}

function create(record) {
  const records = all();
  records.push(record);
  writeCollection(COLLECTION, records);
  return record;
}

function update(id, updates) {
  const records = all();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates };
  writeCollection(COLLECTION, records);
  return records[idx];
}

module.exports = { all, findById, create, update };
