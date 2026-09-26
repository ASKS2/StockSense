// ============================================================
// Module: Delivery Orders (Outgoing Stock)
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ============================================================

Session.requireAuth();
renderShell("deliveries.html", "Delivery Orders", "Pick, pack and ship stock to customers.");

let products = [];
let warehouses = [];

async function init() {
  [products, warehouses] = await Promise.all([api("/products"), api("/dashboard/warehouses")]);
  renderPage();
  initLineItemEditor("delivery-lines", "add-line-btn", products);
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head"><strong>New Delivery Order</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="delivery-form">
          <div class="form-row">
            <div><label>Customer</label><input id="d-customer" required /></div>
            <div>
              <label>Warehouse</label>
              <select id="d-warehouse">${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>
            </div>
          </div>
          <label>Line items</label>
          <div id="delivery-lines"></div>
          <button type="button" id="add-line-btn" class="btn btn--sm">+ Add product</button>
          <div><button type="submit" class="btn btn--primary">Create Delivery Order</button></div>
          <div id="form-message"></div>
        </form>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><strong>Delivery Orders</strong></div>
      <div class="panel__body" id="deliveries-table"></div>
    </div>
  `;

  document.getElementById("delivery-form").addEventListener("submit", handleCreate);
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("form-message");
  const body = {
    customer: document.getElementById("d-customer").value.trim(),
    warehouseId: document.getElementById("d-warehouse").value,
    lines: collectLineItems("delivery-lines"),
  };
  try {
    await api("/deliveries", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Delivery order created.</p>`;
    document.getElementById("d-customer").value = "";
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function setReady(id) {
  await api(`/deliveries/${id}/ready`, { method: "POST" });
  await renderTable();
}

async function validateDelivery(id) {
  try {
    await api(`/deliveries/${id}/validate`, { method: "POST" });
    await renderTable();
  } catch (err) {
    alert(err.message);
  }
}

async function renderTable() {
  const deliveries = await api("/deliveries");
  const table = document.getElementById("deliveries-table");

  if (deliveries.length === 0) {
    table.innerHTML = `<p class="empty-state">No delivery orders yet.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead><tr><th>Order</th><th>Customer</th><th>Warehouse</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${deliveries
          .map((d) => {
            const wh = warehouses.find((w) => w.id === d.warehouseId);
            let action = "";
            if (d.status === "Waiting") action = `<button class="btn btn--sm" onclick="setReady('${d.id}')">Mark Picked &amp; Packed</button>`;
            if (d.status === "Ready") action = `<button class="btn btn--sm btn--amber" onclick="validateDelivery('${d.id}')">Validate</button>`;
            return `
            <tr>
              <td class="mono">${d.docNumber}</td>
              <td>${d.customer}</td>
              <td>${wh ? wh.name : "—"}</td>
              <td>${badgeFor(d.status)}</td>
              <td>${action}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

init();
