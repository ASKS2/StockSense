// ============================================================
// Module: Dashboard
// Contributor: Member 2 (Dashboard & Infra)
// ============================================================

Session.requireAuth();
renderShell("dashboard.html", "Dashboard", "Snapshot of today's inventory operations.");

let warehouses = [];

async function loadDashboard() {
  const content = document.getElementById("page-content");
  content.innerHTML = `<p class="empty-state">Loading dashboard…</p>`;

  try {
    warehouses = await api("/dashboard/warehouses");
    const kpis = await api("/dashboard/kpis");
    renderKpis(kpis);
    await renderDocuments();
  } catch (err) {
    content.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

function renderKpis(kpis) {
  document.getElementById("page-content").innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi__value">${kpis.totalProducts}</div><div class="kpi__label">Total Products</div></div>
      <div class="kpi warn"><div class="kpi__value">${kpis.lowStockCount}</div><div class="kpi__label">Low Stock Items</div></div>
      <div class="kpi danger"><div class="kpi__value">${kpis.outOfStockCount}</div><div class="kpi__label">Out of Stock</div></div>
      <div class="kpi ok"><div class="kpi__value">${kpis.pendingReceipts}</div><div class="kpi__label">Pending Receipts</div></div>
      <div class="kpi ok"><div class="kpi__value">${kpis.pendingDeliveries}</div><div class="kpi__label">Pending Deliveries</div></div>
      <div class="kpi"><div class="kpi__value">${kpis.scheduledTransfers}</div><div class="kpi__label">Transfers Scheduled</div></div>
    </div>

    <div class="panel">
      <div class="panel__head">
        <strong>Operations Feed</strong>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <select id="filter-type">
            <option value="">All types</option>
            <option value="Receipt">Receipts</option>
            <option value="Delivery">Delivery</option>
            <option value="Internal">Internal</option>
            <option value="Adjustment">Adjustments</option>
          </select>
          <select id="filter-status">
            <option value="">All statuses</option>
            <option>Draft</option>
            <option>Waiting</option>
            <option>Ready</option>
            <option>Done</option>
            <option>Cancelled</option>
          </select>
          <select id="filter-warehouse">
            <option value="">All warehouses</option>
            ${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="panel__body" id="documents-table"></div>
    </div>
  `;

  ["filter-type", "filter-status", "filter-warehouse"].forEach((id) =>
    document.getElementById(id).addEventListener("change", renderDocuments)
  );
}

async function renderDocuments() {
  const type = document.getElementById("filter-type")?.value || "";
  const status = document.getElementById("filter-status")?.value || "";
  const warehouse = document.getElementById("filter-warehouse")?.value || "";

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  if (warehouse) params.set("warehouse", warehouse);

  const docs = await api(`/dashboard/documents?${params.toString()}`);
  const table = document.getElementById("documents-table");

  if (docs.length === 0) {
    table.innerHTML = `<p class="empty-state">No operations match these filters yet.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead><tr><th>Document</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
      <tbody>
        ${docs
          .map(
            (d) => `
          <tr>
            <td class="mono">${d.docNumber}</td>
            <td>${d.type}</td>
            <td>${badgeFor(d.status)}</td>
            <td>${new Date(d.createdAt).toLocaleString()}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

loadDashboard();
