const app = document.querySelector("#app");

let items = [
  { id: 1, n: "USB cable", sku: "CAB-01", stock: 3 },
  { id: 2, n: "Notebook", sku: "NOTE-12", stock: 12 },
  { id: 3, n: "Sticker pack", sku: "STK-20", stock: 5 },
];

let query = "";
let sort = "name";

// Escape dynamic text before inserting it into HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

// Return the filtered and correctly sorted inventory.
function getVisibleItems() {
  const search = query.trim().toLowerCase();

  return items
    .filter(
      (item) =>
        item.n.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search)
    )
    .sort((a, b) => {
      if (sort === "stock") {
        return a.stock - b.stock || a.n.localeCompare(b.n);
      }

      return a.n.localeCompare(b.n);
    });
}

function renderList() {
  const list = document.querySelector(".list");
  const view = getVisibleItems();

  if (view.length === 0) {
    list.innerHTML = `
      <p class="muted" role="status">
        No matching items found.
      </p>
    `;
    return;
  }

  list.innerHTML = view
    .map((item) => {
      const isOutOfStock = item.stock === 0;
      const isLowStock = item.stock > 0 && item.stock <= 5;

      const stockClass = isOutOfStock
        ? "danger-text"
        : isLowStock
          ? "warning"
          : "";

      const stockMessage = isOutOfStock
        ? "Out of stock"
        : isLowStock
          ? "Low stock"
          : "";

      return `
        <article class="item">
          <div>
            <strong>${escapeHTML(item.n)}</strong>
            <span class="muted small">
              ${escapeHTML(item.sku)}
            </span>
          </div>

          <div class="row">
            <span class="${stockClass}">
              ${item.stock} in stock
              ${stockMessage ? `· ${stockMessage}` : ""}
            </span>

            <button
              type="button"
              class="secondary"
              data-dec="${item.id}"
              aria-label="Decrease stock for ${escapeHTML(item.n)}"
              ${isOutOfStock ? "disabled" : ""}
            >
              −
            </button>

            <button
              type="button"
              data-inc="${item.id}"
              aria-label="Increase stock for ${escapeHTML(item.n)}"
            >
              +
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function render() {
  app.innerHTML = `
    <div class="row space">
      <div>
        <span class="label">Store room</span>
        <h2>${items.length} items</h2>
      </div>

      <select id="sort" aria-label="Sort inventory">
        <option value="name">Sort by name</option>
        <option value="stock">Sort by stock</option>
      </select>
    </div>

    <input
      id="query"
      type="search"
      placeholder="Search name or SKU"
      aria-label="Search name or SKU"
    />

    <div class="list"></div>
  `;

  const searchInput = document.querySelector("#query");
  const sortSelect = document.querySelector("#sort");

  searchInput.value = query;
  sortSelect.value = sort;

  renderList();

  // Search without destroying the input or losing keyboard focus.
  searchInput.addEventListener("input", (event) => {
    query = event.target.value;
    renderList();
  });

  // Preserve the selected sorting option.
  sortSelect.addEventListener("change", (event) => {
    sort = event.target.value;
    renderList();
  });

  // Event delegation: works after list updates.
  app.querySelector(".list").addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    const isDecrease = button.hasAttribute("data-dec");
    const isIncrease = button.hasAttribute("data-inc");

    if (!isDecrease && !isIncrease) return;

    const id = Number(
      isDecrease ? button.dataset.dec : button.dataset.inc
    );

    const item = items.find((item) => item.id === id);

    if (!item) return;

    if (isDecrease) {
      // Never allow negative stock.
      item.stock = Math.max(0, item.stock - 1);
    }

    if (isIncrease) {
      item.stock += 1;
    }

    renderList();
  });
}

render();
