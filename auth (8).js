// ============================================================
// Module: Authentication
// Contributor: Member 1 (Auth & Profile)
// ------------------------------------------------------------
// Endpoints:
//   POST /api/auth/signup
//   POST /api/auth/login
//   POST /api/auth/forgot-password   -> sends OTP
//   POST /api/auth/reset-password    -> verifies OTP, sets new password
//   GET  /api/auth/me                -> current user profile
//   PUT  /api/auth/me                -> update profile
// ============================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const User = require("../models/User");
const otp = require("../utils/otp");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (User.findByEmail(email)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = User.create({
    id: `user-${nanoid(8)}`,
    name,
    email,
    role: role || "Inventory Manager",
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = User.findByEmail(email || "");

  if (!user || !bcrypt.compareSync(password || "", user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = User.findByEmail(email || "");
  if (!user) {
    // Don't reveal whether the account exists.
    return res.json({ message: "If that email exists, an OTP has been sent." });
  }

  const code = otp.generate(email);
  otp.deliver(email, code);

  res.json({
    message: "OTP sent to your email.",
    // demoOtp is only included so the hackathon demo works without
    // a real email provider wired up — remove this field in production.
    demoOtp: code,
  });
});

router.post("/reset-password", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!otp.verify(email || "", code || "")) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const user = User.findByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  User.update(user.id, { passwordHash: bcrypt.hashSync(newPassword, 10) });
  res.json({ message: "Password reset successfully. You can now log in." });
});

router.get("/me", requireAuth, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.put("/me", requireAuth, (req, res) => {
  const { name, role } = req.body;
  const updated = User.update(req.user.id, {
    ...(name && { name }),
    ...(role && { role }),
  });
  res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
});

module.exports = router;
