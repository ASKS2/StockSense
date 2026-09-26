// ============================================================
// Module: Authentication
// Contributor: Member 1 (Auth & Profile)
// ------------------------------------------------------------
// Drives index.html (login), signup.html and
// forgot-password.html. All three share this one file since
// the flows are small and closely related.
// ============================================================

function showMessage(text, type = "error") {
  const el = document.getElementById("form-message");
  if (!el) return;
  el.innerHTML = `<p class="${type === "error" ? "error-text" : "success-text"}">${text}</p>`;
}

// ---------- Login ----------
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      Session.save(data.token, data.user);
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err.message);
    }
  });
}

// ---------- Signup ----------
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const data = await api("/auth/signup", { method: "POST", body: { name, role, email, password } });
      Session.save(data.token, data.user);
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err.message);
    }
  });
}

// ---------- Forgot / reset password ----------
const requestOtpForm = document.getElementById("request-otp-form");
if (requestOtpForm) {
  let verifiedEmail = "";

  requestOtpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    try {
      const data = await api("/auth/forgot-password", { method: "POST", body: { email } });
      verifiedEmail = email;
      document.getElementById("step-request").style.display = "none";
      document.getElementById("step-reset").style.display = "block";
      const hint = data.demoOtp ? ` (demo OTP: ${data.demoOtp})` : "";
      showMessage(`OTP sent${hint}.`, "success");
    } catch (err) {
      showMessage(err.message);
    }
  });

  document.getElementById("reset-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("code").value.trim();
    const newPassword = document.getElementById("new-password").value;
    try {
      await api("/auth/reset-password", { method: "POST", body: { email: verifiedEmail, code, newPassword } });
      showMessage("Password reset. Redirecting to login…", "success");
      setTimeout(() => (window.location.href = "index.html"), 1200);
    } catch (err) {
      showMessage(err.message);
    }
  });
}
