// ============================================================
// Module: Internal Transfers
// Contributor: Member 4 (Deliveries, Transfers & Adjustments)
// ============================================================

Session.requireAuth();
renderShell("transfers.html", "Internal Transfers", "Move stock between warehouses, racks or production floors.");

let products = [];
let warehouses = [];

async function init() {
  [products, warehouses] = await Promise.all([api("/products"), api("/dashboard/warehouses")]);
  renderPage();
  initLineItemEditor("transfer-lines", "add-line-btn", products);
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head"><strong>New Internal Transfer</strong></div>
      <div class="panel__body" style="padding:16px 18px;">
        <form id="transfer-form">
          <div class="form-row">
            <div>
              <label>From</label>
              <select id="t-source">${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>
            </div>
            <div>
              <label>To</label>
              <select id="t-dest">${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>
            </div>
          </div>
          <label>Line items</label>
          <div id="transfer-lines"></div>
          <button type="button" id="add-line-btn" class="btn btn--sm">+ Add product</button>
          <div><button type="submit" class="btn btn--primary">Create Transfer</button></div>
          <div id="form-message"></div>
        </form>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><strong>Transfers</strong></div>
      <div class="panel__body" id="transfers-table"></div>
    </div>
  `;

  document.getElementById("transfer-form").addEventListener("submit", handleCreate);
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("form-message");
  const body = {
    sourceWarehouseId: document.getElementById("t-source").value,
    destWarehouseId: document.getElementById("t-dest").value,
    lines: collectLineItems("transfer-lines"),
  };
  try {
    await api("/transfers", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Transfer created.</p>`;
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function validateTransfer(id) {
  try {
    await api(`/transfers/${id}/validate`, { method: "POST" });
    await renderTable();
  } catch (err) {
    alert(err.message);
  }
}

async function renderTable() {
  const transfers = await api("/transfers");
  const table = document.getElementById("transfers-table");

  if (transfers.length === 0) {
    table.innerHTML = `<p class="empty-state">No internal transfers yet.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead><tr><th>Transfer</th><th>From → To</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${transfers
          .map((t) => {
            const src = warehouses.find((w) => w.id === t.sourceWarehouseId);
            const dest = warehouses.find((w) => w.id === t.destWarehouseId);
            return `
            <tr>
              <td class="mono">${t.docNumber}</td>
              <td>${src ? src.name : "—"} → ${dest ? dest.name : "—"}</td>
              <td>${badgeFor(t.status)}</td>
              <td>${t.status !== "Done" ? `<button class="btn btn--sm btn--amber" onclick="validateTransfer('${t.id}')">Validate</button>` : ""}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

init();
