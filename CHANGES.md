# Inventory List – bug fixes

Suggested commits (one per fix):

1. `fix: sort by name used non-existent "name" key` – sort option values now map to the real `n` / `stock` properties; stock sorts numerically, names use localeCompare, equal values return 0.
2. `fix: keep selected sort option after re-render` – the <select> now marks the active option as selected.
3. `fix: search input lost focus on every keystroke` – focus and caret position are restored after render.
4. `fix: prevent stock going below zero` – decrement clamps at 0 and the "−" button is disabled at 0.
5. `fix: escape user input in rendered HTML` – search text and item fields are HTML-escaped (a `"` in the search box used to break the input).
6. `fix: header count ignores search` – shows "N of M items" while filtering.
7. `feat: empty state and out-of-stock styling` – "No items match your search." message; 0 stock shows "Out of stock" in red.
8. `a11y: label controls` – aria-labels on search, sort and +/- buttons; buttons have type="button".
9. `chore: rename gitignore.txt to .gitignore`

## Feature / polish commits

10. `feat: add-item form` – name, SKU (auto-uppercased) and starting stock, with validation (required fields, duplicate SKU, whole number >= 0).
11. `feat: remove item` – delete button with confirmation.
12. `feat: summary tiles` – total units, low-stock count, out-of-stock count.
13. `feat: low-stock-only filter` and status pills (In stock / Low stock / Out of stock) with colour-coded stock bars.
14. `feat: persist items in localStorage`.
15. `refactor: build page shell once` – only stats and list re-render, so inputs never lose focus.
16. `style: UI polish` – gradient title, hover/focus states, responsive layout for phones, reduced-motion support.
