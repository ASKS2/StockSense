// ============================================================
// Module: Authentication
// Contributor: Member 1 (Auth & Profile)
// ============================================================

const { readCollection, writeCollection } = require("../config/db");

const COLLECTION = "users";

function all() {
  return readCollection(COLLECTION);
}

function findByEmail(email) {
  return all().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findById(id) {
  return all().find((u) => u.id === id);
}

function create(user) {
  const users = all();
  users.push(user);
  writeCollection(COLLECTION, users);
  return user;
}

function update(id, updates) {
  const users = all();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  writeCollection(COLLECTION, users);
  return users[idx];
}

module.exports = { all, findByEmail, findById, create, update };
