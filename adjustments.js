// ============================================================
// Module: Stock Adjustments
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ============================================================

Session.requireAuth();
renderShell("adjustments.html", "Stock Adjustments", "Reconcile recorded stock against a physical count.");

let products = [];
let warehouses = [];

async function init() {
  [products, warehouses] = await Promise.all([api("/products"), api("/dashboard/warehouses")]);
  renderPage();
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head"><strong>New Adjustment</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="adjustment-form">
          <div class="form-row">
            <div>
              <label>Product</label>
              <select id="a-product">${products.map((p) => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join("")}</select>
            </div>
            <div>
              <label>Location</label>
              <select id="a-warehouse">${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>
            </div>
          </div>
          <div class="form-row">
            <div><label>Counted quantity</label><input id="a-quantity" type="number" min="0" required /></div>
            <div><label>Reason (optional)</label><input id="a-reason" placeholder="e.g. 3kg damaged in transit" /></div>
          </div>
          <button type="submit" class="btn btn--primary">Save Adjustment</button>
          <div id="form-message"></div>
        </form>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><strong>Adjustment Log</strong></div>
      <div class="panel__body" id="adjustments-table"></div>
    </div>
  `;

  document.getElementById("adjustment-form").addEventListener("submit", handleCreate);
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("form-message");
  const body = {
    productId: document.getElementById("a-product").value,
    warehouseId: document.getElementById("a-warehouse").value,
    countedQuantity: document.getElementById("a-quantity").value,
    reason: document.getElementById("a-reason").value.trim(),
  };
  try {
    await api("/adjustments", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Adjustment logged and stock updated.</p>`;
    document.getElementById("a-quantity").value = "";
    document.getElementById("a-reason").value = "";
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function renderTable() {
  const adjustments = await api("/adjustments");
  const table = document.getElementById("adjustments-table");

  if (adjustments.length === 0) {
    table.innerHTML = `<p class="empty-state">No adjustments logged yet.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead><tr><th>Doc</th><th>Product</th><th>Location</th><th class="num">Recorded</th><th class="num">Counted</th><th class="num">Delta</th><th>Reason</th></tr></thead>
      <tbody>
        ${adjustments
          .map((a) => {
            const product = products.find((p) => p.id === a.productId);
            const wh = warehouses.find((w) => w.id === a.warehouseId);
            const deltaColor = a.delta < 0 ? "var(--red)" : a.delta > 0 ? "var(--green)" : "var(--slate)";
            return `
            <tr>
              <td class="mono">${a.docNumber}</td>
              <td>${product ? product.name : "—"}</td>
              <td>${wh ? wh.name : "—"}</td>
              <td class="num">${a.recordedQuantity}</td>
              <td class="num">${a.countedQuantity}</td>
              <td class="num" style="color:${deltaColor}; font-weight:600;">${a.delta > 0 ? "+" : ""}${a.delta}</td>
              <td>${a.reason}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

init();
