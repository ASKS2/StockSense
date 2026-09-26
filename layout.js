// ============================================================
// Module: Shared App Shell (sidebar + topbar)
// Contributor: Member 2 (Dashboard & Infra) — used by every
// authenticated page so nav stays consistent across modules
// built by different teammates.
// ============================================================

const NAV_ITEMS = [
  { href: "dashboard.html", label: "Dashboard", icon: "📊" },
  { href: "products.html", label: "Products", icon: "📦" },
  { href: "receipts.html", label: "Receipts", icon: "⬇️" },
  { href: "deliveries.html", label: "Delivery Orders", icon: "⬆️" },
  { href: "transfers.html", label: "Internal Transfers", icon: "🔁" },
  { href: "adjustments.html", label: "Stock Adjustments", icon: "🛠️" },
  { href: "settings.html", label: "Settings", icon: "⚙️" },
];

function renderShell(activePage, pageTitle, pageSubtitle) {
  const user = Session.getUser() || { name: "?" };
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navHtml = NAV_ITEMS.map(
    (item) => `
    <a href="${item.href}" class="${activePage === item.href ? "active" : ""}">
      <span>${item.icon}</span> ${item.label}
    </a>`
  ).join("");

  document.getElementById("app-shell").innerHTML = `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <strong>StockSense</strong>
        <span>Inventory, in real time</span>
      </div>
      <nav>${navHtml}</nav>
      <div class="sidebar__section-label">Account</div>
      <nav>
        <a href="profile.html" class="${activePage === "profile.html" ? "active" : ""}">
          <span>👤</span> My Profile
        </a>
        <a href="#" id="logout-link"><span>↩️</span> Logout</a>
      </nav>
      <div class="sidebar__footer">Built for Hackathon 2026 by Team StockSense</div>
    </aside>
    <div class="main">
      <header class="topbar">
        <div>
          <h1>${pageTitle}</h1>
          ${pageSubtitle ? `<p>${pageSubtitle}</p>` : ""}
        </div>
        <div class="topbar__user">
          <div class="avatar">${initials}</div>
          <div>
            <div><strong>${user.name}</strong></div>
            <div style="color: var(--slate); font-size:12px;">${user.role || ""}</div>
          </div>
        </div>
      </header>
      <div class="content" id="page-content"></div>
    </div>
  `;

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    Session.clear();
    window.location.href = "index.html";
  });
}

// ---------- Shared line-item editor ----------
// Used by Receipts, Delivery Orders and Internal Transfers so
// each of those pages doesn't reimplement "add another line".
let lineItemCounter = 0;

function lineItemRow(products) {
  lineItemCounter += 1;
  const id = `line-${lineItemCounter}`;
  return `
    <div class="line-item-row" data-line-id="${id}">
      <div>
        <label>Product</label>
        <select class="line-product">
          ${products.map((p) => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Quantity</label>
        <input type="number" class="line-qty" min="1" value="1" />
      </div>
      <button type="button" class="btn btn--sm remove-line">✕</button>
    </div>
  `;
}

function initLineItemEditor(containerId, addBtnId, products) {
  const container = document.getElementById(containerId);
  container.innerHTML = lineItemRow(products);

  document.getElementById(addBtnId).addEventListener("click", () => {
    container.insertAdjacentHTML("beforeend", lineItemRow(products));
    attachRemoveHandlers(container);
  });
  attachRemoveHandlers(container);
}

function attachRemoveHandlers(container) {
  container.querySelectorAll(".remove-line").forEach((btn) => {
    btn.onclick = () => {
      if (container.children.length > 1) btn.closest(".line-item-row").remove();
    };
  });
}

function collectLineItems(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .line-item-row`);
  return Array.from(rows).map((row) => ({
    productId: row.querySelector(".line-product").value,
    quantity: Number(row.querySelector(".line-qty").value),
  }));
}

function badgeFor(status) {
  const map = {
    Draft: "draft",
    Waiting: "waiting",
    Ready: "ready",
    Done: "done",
    Cancelled: "cancelled",
  };
  const cls = map[status] || "draft";
  return `<span class="badge badge--${cls}">${status}</span>`;
}
