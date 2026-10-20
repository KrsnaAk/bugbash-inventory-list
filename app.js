const app = document.querySelector("#app");
let items = [
  { id: 1, n: "USB cable", sku: "CAB-01", stock: 3 },
  { id: 2, n: "Notebook", sku: "NOTE-12", stock: 12 },
  { id: 3, n: "Sticker pack", sku: "STK-20", stock: 5 },
];
let query = "",
  sort = "name";
function render() {
  const view = items
    .filter(
      (i) =>
        i.n.toLowerCase().includes(query.toLowerCase()) ||
        i.sku.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (a[sort] > b[sort] ? 1 : -1));
  app.innerHTML = `<div class="row space"><div><span class="label">Store room</span><h2>${items.length} items</h2></div><select id="sort"><option value="name">Sort by name</option><option value="stock">Sort by stock</option></select></div><input id="query" value="${query}" placeholder="Search name or SKU"/><div class="list">${view.map((i) => `<article class="item"><div><strong>${i.n}</strong><span class="muted small">${i.sku}</span></div><div class="row"><span class="${i.stock <= 5 ? "warning" : ""}">${i.stock} in stock</span><button class="secondary" data-dec="${i.id}">−</button><button data-inc="${i.id}">+</button></div></article>`).join("")}</div>`;
  document.querySelector("#query").oninput = (e) => {
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
        items.find((i) => i.id === Number(b.dataset.dec)).stock--;
        render();
      }),
  );
  document.querySelectorAll("[data-inc]").forEach(
    (b) =>
      (b.onclick = () => {
        items.find((i) => i.id === Number(b.dataset.inc)).stock++;
        render();
      }),
  );
}
render();


// Added organizer feature: low-stock count.
function renderLowStockSummary() {
  const host = document.querySelector("#app"); if (!host || document.querySelector("#low-stock-summary")) return;
  const summary = document.createElement("p"); summary.id = "low-stock-summary"; summary.className = "muted small";
  summary.textContent = items.filter((item) => item.stock <= 5).length + " low-stock item(s)"; host.querySelector("h2")?.after(summary);
}
renderLowStockSummary();


// Inventory expansion: reorder queue and stock summary.
(() => {
  const baseRender = render; let reorderPoint = 5;
  const enhance = () => {
    if (document.querySelector("#inventory-tools")) return;
    const panel = document.createElement("section"); panel.id = "inventory-tools"; panel.className = "item";
    panel.innerHTML = '<strong>Inventory tools</strong><div class="row"><input id="reorder-point" type="number" value="5" min="0"/><button id="apply-reorder" type="button">Apply threshold</button></div><p id="inventory-summary" class="muted small"></p>';
    document.querySelector("#app")?.append(panel);
    const update = () => { const low = items.filter((item) => item.stock <= reorderPoint); panel.querySelector("#inventory-summary").textContent = low.length + " item(s) need replenishment"; };
    panel.querySelector("#apply-reorder").onclick = () => { reorderPoint = Number(panel.querySelector("#reorder-point").value); update(); };
    update();
  };
  render = () => { baseRender(); enhance(); };
  enhance();
})();
