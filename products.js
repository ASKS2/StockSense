// ============================================================
// Module: Product Management
// Contributor: Member 3 (Products & Receipts)
// ============================================================

Session.requireAuth();
renderShell("products.html", "Products", "Create products and see stock availability per location.");

let warehouses = [];

async function init() {
  warehouses = await api("/dashboard/warehouses");
  renderPage();
  await renderTable();
}

function renderPage() {
  document.getElementById("page-content").innerHTML = `
    <div class="panel">
      <div class="panel__head">
        <strong>New Product</strong>
      </div>
      <div class="panel__body" style="padding: 16px 18px;">
        <form id="product-form">
          <div class="form-row">
            <div><label>Name</label><input id="p-name" required /></div>
            <div><label>SKU / Code</label><input id="p-sku" required /></div>
          </div>
          <div class="form-row">
            <div><label>Category</label><input id="p-category" placeholder="e.g. Raw Material" /></div>
            <div><label>Unit of Measure</label><input id="p-unit" placeholder="e.g. kg, pcs" required /></div>
          </div>
          <div class="form-row">
            <div><label>Reorder Level</label><input id="p-reorder" type="number" min="0" value="0" /></div>
            <div><label>Initial Stock (optional)</label><input id="p-initial" type="number" min="0" /></div>
          </div>
          <label>Warehouse for initial stock</label>
          <select id="p-warehouse">
            ${warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}
          </select>
          <button type="submit" class="btn btn--primary">Add Product</button>
          <div id="form-message"></div>
        </form>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head">
        <strong>Product Catalog</strong>
        <input id="search-box" placeholder="Search by name or SKU…" style="max-width:220px;" />
      </div>
      <div class="panel__body" id="products-table"></div>
    </div>
  `;

  document.getElementById("product-form").addEventListener("submit", handleCreate);
  document.getElementById("search-box").addEventListener("input", renderTable);
}

async function handleCreate(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById("p-name").value.trim(),
    sku: document.getElementById("p-sku").value.trim(),
    category: document.getElementById("p-category").value.trim(),
    unit: document.getElementById("p-unit").value.trim(),
    reorderLevel: document.getElementById("p-reorder").value,
    initialStock: document.getElementById("p-initial").value,
    warehouseId: document.getElementById("p-warehouse").value,
  };
  const msg = document.getElementById("form-message");
  try {
    await api("/products", { method: "POST", body });
    msg.innerHTML = `<p class="success-text">Product added.</p>`;
    document.getElementById("product-form").reset();
    await renderTable();
  } catch (err) {
    msg.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

async function renderTable() {
  const q = document.getElementById("search-box")?.value || "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);

  const products = await api(`/products?${params.toString()}`);
  const table = document.getElementById("products-table");

  if (products.length === 0) {
    table.innerHTML = `<p class="empty-state">No products yet — add your first one above.</p>`;
    return;
  }

  table.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>SKU</th><th>Category</th><th>Unit</th><th class="num">Total Stock</th><th class="num">Reorder At</th></tr>
      </thead>
      <tbody>
        ${products
          .map(
            (p) => `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td class="mono">${p.sku}</td>
            <td>${p.category}</td>
            <td>${p.unit}</td>
            <td class="num">${p.totalStock <= p.reorderLevel ? `<span style="color:var(--red); font-weight:600;">${p.totalStock}</span>` : p.totalStock}</td>
            <td class="num">${p.reorderLevel}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

init();
