# Build Log

## 2026-08-13 — Filters apply on APPLY, not on click

**Ask:** filters in the FILTER / FEATURED drawer were applying the instant they were
clicked; they should stage, and only take effect on APPLY.

**Cause:** every control carried `onchange="this.form.submit()"` — native filter
checkboxes, colour dots, availability boxes, sort radios and both price sliders. A
shopper could only ever pick one thing per page load.

**Second, hidden problem:** APPLY read only `.vtag-filter` tag checkboxes. Removing the
auto-submit alone would have made it silently drop every native filter and the sort. So
APPLY was rewritten to rebuild the whole URL: tags as a tag path, native filters and
sort as query params, price only when moved off the full range. It is also scoped to
its own panel, so the drawer and the desktop sidebar cannot read each other's controls.

Colour dots hide their checkbox behind a coloured span and relied on the reload to show
a pick, so they now toggle their own active state.

**Verified live**
- Drawer: staged colour BLACK + availability + sort price-descending → URL unchanged,
  dot visibly active, 12 products still on screen. APPLY → one navigation to
  `?filter.v.option.color=BLACK&filter.v.availability=1&sort_by=price-descending`,
  100 → **43** products.
- Sidebar: staged BOTTLE-GREEN + availability while the drawer separately held BLACK.
  APPLY → `?filter.v.option.color=BOTTLE-GREEN&filter.v.availability=1`, 100 → **2**,
  and the drawer's BLACK did **not** leak.
- Auto-submit handlers remaining in the drawer: **0**.
- The desktop topbar sort `<select>` deliberately still submits on change — it is a
  standalone dropdown outside the drawer, not part of a staged set.

**Not a bug, checked:** with price-descending the last card reads ₹889 after a run of
₹600s. Shopify sorts by the product's minimum variant price (₹599.50 here) while the
card shows the selected colour's price. Sorting is correct.

## 2026-08-13 — Size filter: tag bypass, one-line row, numeric only

**Root cause of the dead filter:** `filter.v.option.size` is silently ignored unless
the Size filter is enabled in Search & Discovery. The URL is accepted and the product
count never moves (`?filter.v.option.size=46` → 100 of 100), whereas
`?filter.v.availability=1` → 100 → 95. So the pills were decorative.

**Bypass, verified working:** Shopify's built-in tag routes filter server-side with no
app at all — measured on this store: `/collections/all` 100 → `/collections/all/elbow-sleeves`
6 → `/collections/all/short-sleeves` 2.

**Size now resolves in three tiers** (`sections/vamas-collection.liquid`), upgrading itself
as each becomes available:
1. native `size_filter` from Search & Discovery
2. `size-NN` product tags via tag routes — real filtering today
3. the `size_list` setting as inert placeholders

Picking a size keeps any sleeve/neckline tag already active, and a script re-attaches
`filter.*` query params that a tag path would otherwise drop.

**Numeric sizes only.** The catalogue splits exactly 50/50: 50 products carry numeric
sizes (32–50), the other 50 carry **only** M/L/XL/XXL on their SIZE option — old import
data for sizes Vamas does not sell. All three tiers filter to numeric values via
`| times: 1` (returns 0 for non-numeric). Those 50 products cannot be size-filtered at
all until their SIZE option is changed to numbers — listed in `products-with-letter-sizes.txt`.

**Size row layout**
- Phone: one scrolling line with every size, `+N` removed (15 pills, 756px scroll width
  in a 375px viewport, page overflow 0). The active pill is scrolled into view on load.
- Desktop sidebar: still one line with `+N`. Fixed a bug where the fit loop measured
  while the label still read `+0`; the real `+12` was wider and pushed a pill onto a
  second line. Tightened the sidebar pills too — 2 → 4 sizes visible.

**Handed over:** `size-tags-import.csv` (50 products, 334 size tags, existing tags
preserved — verified against two independent endpoints that untagged products really
are untagged, so the import will not wipe anything).

**Blocked:** writing the tags needs the Shopify connector, which asks for re-auth that
this session cannot complete.

## 2026-08-13 — Tablet view (769–1024px) site-wide

**Ask:** "pure website ka tab view bhi theek karo, acheses dikhe per desktop or phone ko kuch mat karna"

**Root cause:** Three files declared their tablet media query with no whitespace —
`@media(min-width:769px)and(max-width:1024px)`. That form is invalid CSS and never
matches, so every tablet rule in those files was dead code. Proven in-browser:

```
matchMedia('(min-width: 769px) and (max-width: 1024px)') -> true
matchMedia('(min-width:769px)and(max-width:1024px)')     -> false
```

**Changed**
- `assets/vamas-cart.css:147`, `assets/vamas-theme.css:1149`, `assets/vamas-product.css:289` — fixed the media query whitespace, reviving the existing tablet rules.
- `assets/vamas-theme.css` — new tablet block: header link/icon tightening, homepage rails 4-up → 3-up, hero copy widths, section padding.
- `assets/vamas-collection.css` — sidebar 200 → 168px, grid gap 20 → 14px, body padding 32 → 24px.

**Measured at 819px (834 device)**

| Page | Before | After |
| --- | --- | --- |
| Product | 152px overflow; info column 47px | 0 overflow; gallery + info 755px, stacked |
| All pages (header) | ~88px overflow; nav needs 941px in a 723px bar | 0 overflow; icons end at 787px |
| Homepage rails | 4.4 cards/view | 3.1 cards/view (236px cards) |
| Collection | 161px cards, 200px sidebar | 173px cards, 168px sidebar |
| Cart | `335px 360px` — summary ≈ cart | `427px 300px` |
| Contact | — | 0 overflow (only a hidden off-screen toast) |

**Also:** removed a `.vamas-nav__contact-btn { display: none }` tablet rule that never
applied — `.vamas-nav__icons > a` (0,1,1) outranks it (0,1,0). The nav fits with the
button showing, so the rule went rather than gaining specificity it did not need.

**Regression checks:** 1024px → tablet MQ true, 0 overflow, 236px cards. 1280px desktop
→ sidebar 240, 4-up grid, gap 20, contact button visible, 0 overflow. 375px phone →
2-up grid, gap 10, contact hidden, 0 overflow. Desktop and phone untouched, as asked.

**Verification method:** DOM property reads (`getBoundingClientRect`, `getComputedStyle`,
`scrollWidth`) and `matchMedia`, not screenshots — the screenshot tool in this
environment renders stale frames after JS-driven DOM mutation.

**Commits:** tablet media-query fix + `Tablet: widen collection cards, drop the dead contact-btn hide rule`
