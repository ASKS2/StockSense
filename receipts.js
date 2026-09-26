// ============================================================
// Module: Receipts (Incoming Stock)
// Contributor: Member 3 (Products & Receipts)
// ============================================================

Session.requireAuth();
renderShell("receipts.html", "Receipts", "Record stock arriving from suppliers.");

let products = [];
let warehouses = [];

async function init() {
  [products, warehouses] = await Promise.all([api("/products"), api("/dashboard/warehouses")]);
  renderPage();
  initLineItemEditor("receipt-lines", "add-line-btn", products);
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head"><strong>New Receipt</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="receipt-form">
          <div class="form-row">
            <div><label>Supplier</label><input id="r-supplier" required /></div>
            <div>
              <label>Warehouse</label>
              <select id="r-warehouse">${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>
            </div>
          </div>
          <label>Line items</label>
          <div id="receipt-lines"></div>
          <button type="button" id="add-line-btn" class="btn btn--sm">+ Add product</button>
          <div><button type="submit" class="btn btn--primary">Create Receipt (Draft)</button></div>
          <div id="form-message"></div>
        </form>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><strong>Receipts</strong></div>
      <div class="panel__body" id="receipts-table"></div>
    </div>
  `;

  document.getElementById("receipt-form").addEventListener("submit", handleCreate);
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("form-message");
  const body = {
    supplier: document.getElementById("r-supplier").value.trim(),
    warehouseId: document.getElementById("r-warehouse").value,
    lines: collectLineItems("receipt-lines"),
  };
  try {
    await api("/receipts", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Receipt created as Draft. Validate it below to add stock.</p>`;
    document.getElementById("r-supplier").value = "";
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function validateReceipt(id) {
  try {
    await api(`/receipts/${id}/validate`, { method: "POST" });
    await renderTable();
  } catch (err) {
    alert(err.message);
  }
}

async function renderTable() {
  const receipts = await api("/receipts");
  const table = document.getElementById("receipts-table");

  if (receipts.length === 0) {
    table.innerHTML = `<p class="empty-state">No receipts yet.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead><tr><th>Receipt</th><th>Supplier</th><th>Warehouse</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${receipts
          .map((r) => {
            const wh = warehouses.find((w) => w.id === r.warehouseId);
            return `
            <tr>
              <td class="mono">${r.docNumber}</td>
              <td>${r.supplier}</td>
              <td>${wh ? wh.name : "—"}</td>
              <td>${badgeFor(r.status)}</td>
              <td>${r.status !== "Done" ? `<button class="btn btn--sm btn--amber" onclick="validateReceipt('${r.id}')">Validate</button>` : ""}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

init();
