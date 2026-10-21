const app = document.querySelector("#app");
let items = [
  { id: 1, n: "USB cable", sku: "CAB-01", stock: 3 },
  { id: 2, n: "Notebook", sku: "NOTE-12", stock: 12 },
  { id: 3, n: "Sticker pack", sku: "STK-20", stock: 5 },
];
let query = "",
  sort = "n";

function render() {
  const view = items
    .filter(
      (i) =>
        i.n.toLowerCase().includes(query.toLowerCase()) ||
        i.sku.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0));

  app.innerHTML = `
    <div class="row space">
      <div><span class="label">Store room</span><h2>${items.length} items</h2></div>
      <select id="sort">
        <option value="n" ${sort === "n" ? "selected" : ""}>Sort by name</option>
        <option value="stock" ${sort === "stock" ? "selected" : ""}>Sort by stock</option>
      </select>
    </div>
    <input id="query" value="${query}" placeholder="Search name or SKU"/>
    <div class="list">
      ${view.map((i) => `
        <article class="item">
          <div><strong>${i.n}</strong><span class="muted small">${i.sku}</span></div>
          <div class="row">
            <span class="${i.stock <= 5 ? "warning" : ""}">${i.stock} in stock</span>
            <button class="secondary" data-dec="${i.id}">−</button>
            <button data-inc="${i.id}">+</button>
          </div>
        </article>
      `).join("")}
    </div>`;

  const input = document.querySelector("#query");
  input.value = query;
  input.focus();
  input.selectionStart = input.selectionEnd = input.value.length;

  input.oninput = (e) => {
    query = e.target.value;
    render();
  };

  document.querySelector("#sort").onchange = (e) => {
    sort = e.target.value;
    render();
  };

  document.querySelectorAll("[data-dec]").forEach(
    (b) =>
      (b.onclick = () => {
        const item = items.find((i) => i.id === Number(b.dataset.dec));
        if (item && item.stock > 0) item.stock--;
        render();
      }),
  );

  document.querySelectorAll("[data-inc]").forEach(
    (b) =>
      (b.onclick = () => {
        const item = items.find((i) => i.id === Number(b.dataset.inc));
        if (item) item.stock++;
        render();
      }),
  );
}

render();