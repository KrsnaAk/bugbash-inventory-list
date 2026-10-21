const app = document.querySelector("#app");

const STORAGE_KEY = "inventory-list-items";
const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_ITEMS = [
  { id: 1, n: "USB cable", sku: "CAB-01", stock: 3 },
  { id: 2, n: "Notebook", sku: "NOTE-12", stock: 12 },
  { id: 3, n: "Sticker pack", sku: "STK-20", stock: 5 },
];

// Sort option values map to the real property names on each item.
const SORT_KEYS = { name: "n", stock: "stock" };

let items = loadItems();
let query = "";
let sort = "name";
let lowOnly = false;

/* ---------- storage ---------- */

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) {
    /* storage unavailable or corrupt – fall back to defaults */
  }
  return DEFAULT_ITEMS.map((i) => ({ ...i }));
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    /* ignore – the app still works without persistence */
  }
}

/* ---------- helpers ---------- */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function compare(a, b) {
  const key = SORT_KEYS[sort] || "n";
  const x = a[key];
  const y = b[key];
  if (typeof x === "number" && typeof y === "number") return x - y;
  return String(x).localeCompare(String(y), undefined, {
    sensitivity: "base",
  });
}

function status(stock) {
  if (stock <= 0) return { cls: "danger-text", pill: "pill-out", label: "Out of stock" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { cls: "warning", pill: "pill-low", label: "Low stock" };
  return { cls: "ok", pill: "pill-ok", label: "In stock" };
}

function nextId() {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

/* ---------- static shell (built once so inputs keep focus) ---------- */

function buildShell() {
  app.innerHTML = `
    <div class="row space head">
      <div>
        <span class="label">Store room</span>
        <h2 id="count"></h2>
      </div>
    </div>

    <div id="stats" class="grid stats"></div>

    <form id="add-form" class="add-form" novalidate>
      <span class="label">Add new item</span>
      <div class="form-grid">
        <label class="field">
          <span class="small muted">Name</span>
          <input id="add-name" type="text" maxlength="40" placeholder="e.g. HDMI cable" autocomplete="off" />
        </label>
        <label class="field">
          <span class="small muted">SKU</span>
          <input id="add-sku" type="text" maxlength="20" placeholder="e.g. CAB-02" autocomplete="off" />
        </label>
        <label class="field">
          <span class="small muted">Stock</span>
          <input id="add-stock" type="number" min="0" step="1" value="1" inputmode="numeric" />
        </label>
        <button type="submit" class="add-btn">+ Add item</button>
      </div>
      <p id="form-error" class="form-error" role="alert" hidden></p>
    </form>

    <div class="toolbar">
      <input id="query" type="search" placeholder="Search name or SKU" aria-label="Search name or SKU" autocomplete="off" />
      <select id="sort" aria-label="Sort items">
        <option value="name">Sort by name</option>
        <option value="stock">Sort by stock</option>
      </select>
      <label class="toggle">
        <input id="low-only" type="checkbox" />
        <span>Low stock only</span>
      </label>
    </div>

    <div id="list" class="list"></div>`;

  document.querySelector("#query").addEventListener("input", (e) => {
    query = e.target.value;
    update();
  });
  document.querySelector("#sort").addEventListener("change", (e) => {
    sort = e.target.value;
    update();
  });
  document.querySelector("#low-only").addEventListener("change", (e) => {
    lowOnly = e.target.checked;
    update();
  });
  document.querySelector("#add-form").addEventListener("submit", onAdd);

  document.querySelector("#list").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const action = btn.dataset.action;
    if (action === "inc") item.stock++;
    if (action === "dec" && item.stock > 0) item.stock--; // never below zero
    if (action === "del") {
      if (!confirm(`Remove "${item.n}" from the list?`)) return;
      items = items.filter((i) => i.id !== id);
    }
    saveItems();
    update();
  });
}

/* ---------- add item ---------- */

function showError(message) {
  const el = document.querySelector("#form-error");
  el.textContent = message;
  el.hidden = !message;
}

function onAdd(e) {
  e.preventDefault();
  const nameEl = document.querySelector("#add-name");
  const skuEl = document.querySelector("#add-sku");
  const stockEl = document.querySelector("#add-stock");

  const n = nameEl.value.trim();
  const sku = skuEl.value.trim().toUpperCase();
  const stockRaw = stockEl.value.trim();
  const stock = Number(stockRaw);

  if (!n) return fail("Please enter an item name.", nameEl);
  if (!sku) return fail("Please enter a SKU.", skuEl);
  if (items.some((i) => i.sku.toUpperCase() === sku))
    return fail(`SKU "${sku}" already exists.`, skuEl);
  if (stockRaw === "" || !Number.isInteger(stock) || stock < 0)
    return fail("Stock must be a whole number, 0 or more.", stockEl);

  items.push({ id: nextId(), n, sku, stock });
  saveItems();

  showError("");
  nameEl.value = "";
  skuEl.value = "";
  stockEl.value = "1";
  nameEl.focus();
  update();

  function fail(message, el) {
    showError(message);
    el.focus();
  }
}

/* ---------- rendering ---------- */

function renderStats() {
  const units = items.reduce((sum, i) => sum + i.stock, 0);
  const low = items.filter((i) => i.stock > 0 && i.stock <= LOW_STOCK_THRESHOLD).length;
  const out = items.filter((i) => i.stock <= 0).length;
  document.querySelector("#stats").innerHTML = `
    <div class="tile"><span class="label">Total units</span><strong class="stat">${units}</strong></div>
    <div class="tile"><span class="label">Low stock</span><strong class="stat warning">${low}</strong></div>
    <div class="tile"><span class="label">Out of stock</span><strong class="stat danger-text">${out}</strong></div>`;
}

function renderList() {
  const q = query.trim().toLowerCase();
  const view = items
    .filter((i) => i.n.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    .filter((i) => !lowOnly || i.stock <= LOW_STOCK_THRESHOLD)
    .sort(compare);

  const filtering = q !== "" || lowOnly;
  document.querySelector("#count").textContent = filtering
    ? `${view.length} of ${items.length} items`
    : `${items.length} ${items.length === 1 ? "item" : "items"}`;

  const max = Math.max(10, ...items.map((i) => i.stock));

  document.querySelector("#list").innerHTML = view.length
    ? view
        .map((i) => {
          const s = status(i.stock);
          const pct = Math.min(100, Math.round((i.stock / max) * 100));
          const name = escapeHtml(i.n);
          return `<article class="item">
            <div class="item-main">
              <div class="item-title">
                <strong>${name}</strong>
                <span class="pill ${s.pill}">${s.label}</span>
              </div>
              <span class="muted small">${escapeHtml(i.sku)}</span>
              <div class="bar" aria-hidden="true"><i class="${s.pill}" style="width:${pct}%"></i></div>
            </div>
            <div class="row item-actions">
              <span class="qty ${s.cls}">${i.stock} <span class="small muted">in stock</span></span>
              <button type="button" class="secondary" data-action="dec" data-id="${i.id}"
                aria-label="Decrease stock of ${name}" ${i.stock <= 0 ? "disabled" : ""}>−</button>
              <button type="button" data-action="inc" data-id="${i.id}"
                aria-label="Increase stock of ${name}">+</button>
              <button type="button" class="danger" data-action="del" data-id="${i.id}"
                aria-label="Remove ${name}" title="Remove item">🗑</button>
            </div>
          </article>`;
        })
        .join("")
    : `<div class="empty">${
        items.length
          ? "No items match your filters."
          : "Your store room is empty. Add your first item above."
      }</div>`;
}

function update() {
  renderStats();
  renderList();
}

buildShell();
update();
