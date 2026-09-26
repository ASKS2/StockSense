// ============================================================
// Module: Authentication
// Contributor: Member 1 (Auth & Profile)
// ============================================================

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

module.exports = { requireAuth };
