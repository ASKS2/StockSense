// ============================================================
// Module: Authentication (Profile)
// Contributor: Member 1 (Auth & Profile)
// ============================================================

Session.requireAuth();
renderShell("profile.html", "My Profile", "Update your account details.");

async function init() {
  const me = await api("/auth/me");
  document.getElementById("page-content").innerHTML = `
    <div class="panel" style="max-width:460px;">
      <div class="panel__head"><strong>Account Details</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="profile-form">
          <label>Full name</label>
          <input id="pf-name" value="${me.name}" required />

          <label>Email</label>
          <input value="${me.email}" disabled />
          <p class="hint">Email can't be changed in this demo.</p>

          <label>Role</label>
          <select id="pf-role">
            <option ${me.role === "Inventory Manager" ? "selected" : ""}>Inventory Manager</option>
            <option ${me.role === "Warehouse Staff" ? "selected" : ""}>Warehouse Staff</option>
          </select>

          <button type="submit" class="btn btn--primary">Save Changes</button>
          <div id="form-message"></div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("form-message");
    try {
      const updated = await api("/auth/me", {
        method: "PUT",
        body: { name: document.getElementById("pf-name").value.trim(), role: document.getElementById("pf-role").value },
      });
      Session.save(Session.getToken(), updated);
      msg.innerHTML = `<p class="success-text">Profile updated.</p>`;
      renderShell("profile.html", "My Profile", "Update your account details.");
      init();
    } catch (err) {
      msg.innerHTML = `<p class="error-text">${err.message}</p>`;
    }
  });
}

init();
