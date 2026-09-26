// ============================================================
// Module: Core Data Layer
// Contributor: Member 2 (Dashboard & Infra)
// ------------------------------------------------------------
// StockSense uses a lightweight JSON-file "database" so the
// whole team can run the project instantly with zero external
// services (perfect for a hackathon demo). Swap this out for
// MongoDB/Postgres later without touching the route files —
// every route only talks to the functions exported here.
// ============================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureFile(collection, defaultValue) {
  const file = filePath(collection);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
  }
}

function readCollection(collection) {
  ensureFile(collection, []);
  const raw = fs.readFileSync(filePath(collection), "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeCollection(collection, data) {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2));
  return data;
}

module.exports = { readCollection, writeCollection, DATA_DIR };
