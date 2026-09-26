// ============================================================
// Module: Settings (Warehouses)
// Contributor: Member 2 (Dashboard & Infra)
// ============================================================

Session.requireAuth();
renderShell("settings.html", "Settings", "Manage the warehouses and locations used across StockSense.");

async function init() {
  renderPage();
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head"><strong>Add Warehouse</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="wh-form">
          <div class="form-row">
            <div><label>Name</label><input id="wh-name" required /></div>
            <div><label>Location</label><input id="wh-location" placeholder="City, State" /></div>
          </div>
          <button type="submit" class="btn btn--primary">Add Warehouse</button>
          <div id="form-message"></div>
        </form>
      </div>
    </div>
    <div class="panel">
      <div class="panel__head"><strong>Warehouses</strong></div>
      <div class="panel__body" id="wh-table"></div>
    </div>
  `;
  document.getElementById("wh-form").addEventListener("submit", handleCreate);
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("form-message");
  const body = {
    name: document.getElementById("wh-name").value.trim(),
    location: document.getElementById("wh-location").value.trim(),
  };
  try {
    await api("/dashboard/warehouses", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Warehouse added.</p>`;
    document.getElementById("wh-form").reset();
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function renderTable() {
  const warehouses = await api("/dashboard/warehouses");
  const table = document.getElementById("wh-table");
  table.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Location</th></tr></thead>
      <tbody>
        ${warehouses.map((w) => `<tr><td>${w.name}</td><td>${w.location || "—"}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

init();
