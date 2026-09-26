// ============================================================
// Module: Dashboard & Settings
// Contributor: Member 2 (Dashboard & Infra)
// ============================================================

const { readCollection, writeCollection } = require("../config/db");

const COLLECTION = "warehouses";

function all() {
  return readCollection(COLLECTION);
}

function findById(id) {
  return all().find((w) => w.id === id);
}

function create(warehouse) {
  const warehouses = all();
  warehouses.push(warehouse);
  writeCollection(COLLECTION, warehouses);
  return warehouse;
}

module.exports = { all, findById, create };
