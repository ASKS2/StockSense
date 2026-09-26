// ============================================================
// Module: Authentication (OTP-based password reset)
// Contributor: Member 1 (Auth & Profile)
// ------------------------------------------------------------
// For the hackathon demo there's no SMS/email provider wired
// up, so the OTP is returned directly in the API response and
// printed to the server console. Swap `deliver()` for a real
// email/SMS integration (e.g. Nodemailer, Twilio) in production.
// ============================================================

const otpStore = new Map(); // email -> { code, expiresAt }
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generate(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

function verify(email, code) {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  const isValid = entry.code === code && Date.now() <= entry.expiresAt;
  if (isValid) otpStore.delete(email.toLowerCase());
  return isValid;
}

function deliver(email, code) {
  // Demo-only "delivery": logs to the terminal so whoever is
  // running the backend can see it during a live demo.
  console.log(`\n[StockSense] OTP for ${email}: ${code} (valid 5 min)\n`);
}

module.exports = { generate, verify, deliver };
