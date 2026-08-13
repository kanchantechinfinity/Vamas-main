
# Build Log

## 2026-08-13 — Hero banner sizes (and two sizing bugs found while measuring)

The hero has **no fixed aspect ratio** — JS sets its height from the viewport:

- Desktop (≥769px): `viewportHeight − header(116px)`, minimum 520px
- Phone (≤768px): `viewportHeight − header(96px) − bottomNav(57px)`, minimum 320px

Measured containers:

| Screen | Container | Aspect |
| --- | --- | --- |
| 1920×1080 | 1920 × 964 | 1.99 |
| 1440×900 | 1440 × 784 | 1.84 |
| 1366×768 | 1366 × 652 | 2.10 |
| 1280×800 | 1280 × 684 | 1.87 |
| Tablet 1024×768 | 1024 × 652 | 1.57 |
| iPhone 390×844 | 390 × 691 | 0.56 |
| iPhone 428×926 | 428 × 773 | 0.55 |

**Two bugs found while measuring, both fixed:**

1. Desktop asked Shopify for `1800x760` — a forced 2.37 crop returning only 760px of
   height for a container up to ~1000px. The hero was upscaled about **1.4×**.
2. Mobile asked for `900x1200` — a forced 3:4 crop onto a container that is about 9:16,
   so a square upload was cropped twice and arrived at **480×481**.

Both now request width only (`2400x` / `1200x`) with no crop, so the merchant's framing
survives and `object-fit` plus the existing per-slide focus settings do the cropping.
After the fix the desktop upscale dropped from 1.4× to **1.07×** — the remainder is
because the current upload is only 1600×900.

**Recommended export sizes:** desktop **2400 × 1200** (2:1), phone **1200 × 2100** (≈9:16).
The current mobile banner is square, which is why the model keeps getting cropped
sideways on phones.

## 2026-08-13 — Measurement diagram traced out of the size chart PDF

**Ask:** the how-to-measure section should match the supplied document, drawing included.

**The drawing is vector artwork, not a raster image.** Pulling the PDF's 8 embedded
images gave only the page background, the logo watermark, two soft masks and a gradient
— no blouse. `pdftoppm`, `mutool` and `gs` are not installed here either.

Two steps got there:
1. `qlmanage` (built into macOS) rendered the page so the artwork could actually be seen.
2. Wrote a converter for the page content stream — `q`/`Q`, `cm`, `rg`/`RG`, `m l c v y h
   re`, `f`/`S` — mapping PDF user space (y-up) into SVG (y-down). 841 path operators in,
   73 paths out, 37 of them inside the drawing's bounding box.

The result is an **exact reproduction**, not a redrawn approximation: both blouse views,
the chest / waist / length / sleeve-length arrows, and the back buttons. ~7KB, sharp at
any size, at `assets/vamas-measure-diagram.svg`. Label positions come from the PDF's own
text matrices; they get a white halo so the measurement lines do not run through the
words.

**Verified live:** desktop renders 529×171, phone 543×175 inside a 335px scroller. Fitted
to the phone width the labels dropped to about 5px and stopped being readable, so below
600px the figure holds 560px and scrolls sideways, same as the chart table. Modal still
fits the viewport, page overflow 0.

A merchant `image_picker` setting still overrides the built-in diagram.

**Popup now runs in the sheet's own order:** diagram under its PADDED BLOUSE MEASUREMENT
heading → size chart → the three notes → written measuring steps last (those are extra
guidance, not part of the printed sheet). Desktop modal 600×810 with the diagram at
545×176; phone keeps the 560px scroller. Overlay z-index 10040, page overflow 0.

## 2026-08-13 — Size chart popup rebuilt from the brand's own chart

**Ask:** use Vamas's real size chart (supplied as a PDF), add a how-to-measure section,
open it as a popup.

The popup already existed but carried a generic Bust / Waist / Hip / Length table that
did not match the brand's chart at all. Replaced with the real one, in the same
orientation as the printed chart — measurements down the side, XS–XXL across the top —
so the two can be checked line by line.

**Worth knowing:** the numeric sizes sold on site *are* the chest measurement — 32 = XS
through 42 = XXL. Both labels now sit in the header instead of leaving shoppers to work
it out. This is also what the earlier M/L/XL/XXL variant data was standing in for.

Added the three garment notes from the chart (1.5in seam allowance, margin can be opened
up, measurements vary by fabric), a **HOW TO MEASURE** section with written steps for
chest, waist, length and sleeve, and an optional image setting so the merchant can upload
the diagram from page 2 of the PDF.

**Same z-index bug as the lightbox:** the overlay was at 7500, below the sticky ATC bar's
9991, so the bar covered the bottom of the chart on phones. Raised to 10040, bar hidden
while open, Escape closes.

**Verified live:** all 42 numbers match the PDF exactly. Header reads XS 32 … XXL 42.
INCHES/CM toggle converts correctly (32in → 81.3cm). Phone 375px: modal 375×690, table
scrolls sideways with the measurement column pinned, body scrolls, sticky bar hidden,
page overflow 0. No JS errors.

**Flagged:** the chart stops at XXL/42, but the store sells 44, 46, 48 and 50. Those
sizes have no published measurements — the team needs to supply them.

## 2026-08-13 — Click-to-zoom, nav curve spacing

**Click to zoom was broken two ways, both real:**

1. `.lightbox img` was capped at `88vw`. On a 375px phone that is **330px**, and the
   gallery it opens from is **343px** — so "zoom" made the photo *smaller*. Tapping
   looked like it did nothing.
2. `.lightbox` had `z-index: 8000`, below the sticky ATC bar's **9991**, so on phones
   the bar floated over the zoomed view.

Fixed: lightbox fills the viewport, loads the **original upload** instead of the
`_1000x` thumbnail the gallery uses, sits at `z-index: 10050`, hides the sticky bar and
locks body scroll while open, and a second tap magnifies **2.4×** with drag-to-pan
(pointer events, so it works with mouse and touch). Escape closes it.

**Verified live**

| | Gallery | Lightbox | After magnify tap |
| --- | --- | --- | --- |
| Phone 375px | 343px | 375px | **900px (2.6× the gallery)** |
| Desktop 1400px | 511px | 850px | **2040px (4.0×)** |

Sticky bar `display: none` while open, body locked, src has no `_1000x`, no JS errors.

**Nav:** right padding 8px → 14px so the Contact pill's 12px corner is not fighting the
nav bar's own 100px curve. Gap from pill to nav edge is now 14px.

**Notify popup** (asked about again) was already built and is live: sold-out variant →
NOTIFY ME → 343×312 popup, required email field, posts to `/contact#notify-form` with
the product and the live variant (`BLACK / M`) attached.

**Not done — needs the merchant.** The New Arrivals / Best Sellers VIEW ALL buttons do
link straight to a collection, but there is **no `new-arrivals` and no `best-sellers`
collection in the store** (20 collections exist; neither is among them), so the tabs are
wired to `classic-v` and `super-basic`. Creating those two collections needs the Shopify
connector, which is asking for re-auth.

**Separate bug spotted:** the VIEW ALL in the "As Seen on Instagram" section has
`href="#"` — a dead link. Left alone as it is outside this request.

## 2026-08-13 — Desktop card price row

**Ask:** shrink the price, struck price and discount on desktop — the row looks messy.

**Correction to an earlier entry.** Two days of notes said this was `line-height`, not
wrapping. That was wrong: I had only compared horizontal positions. Counting line boxes
with `Range.getClientRects()` shows **all three parts wrapped on all 10 cards** —
`Rs. 440.65` broke into `Rs.` and `440.65`. The flex row was `nowrap` but the *items*
were not, so each one wrapped inside its own box.

Fixing it took three passes because each fix exposed the next constraint:

1. `nowrap` on the items + 18/12/10 → 16/11/9. Wrapping gone, but four-digit pairs then
   **spilled 23–27px past the card**.
2. Gap 6 → 4px, struck price → 9px. No spill, but the struck price **ellipsized on 10 of
   12 cards** — a clipped price reads as broken.
3. Price 15 → 14px, discount 9 → 8px, freeing ~9px. Clears the worst pair in the
   catalogue.

**Final, verified at 1265px on `?sort_by=price-descending` (widest prices in the store)**

| | Before | After |
| --- | --- | --- |
| Sizes | 18 / 12 / 10 | 14 / 9 / 8, gap 4px |
| Row height | 54px (each part on 2 lines) | **21px, one line** |
| Cards wrapping mid-figure | 10 of 10 | **0 of 12** |
| Cards spilling past the card | — | **0** |
| Struck prices clipped | — | **0** |

Worst real pair `Rs. 1,224.65 / Rs. 3,499.00 / 65% off` ends at 173px in a 175px row.
The ellipsis on the struck price stays as a backstop for anything longer than the
current catalogue.

**Regression checks:** tablet 1037px → 15px, one line, 0 spill/wrap/clip, overflow 0.
Phone 375px → 12px, one line, 0 spill/wrap, overflow 0. Both keep their own overrides.

## 2026-08-13 — Cart's related row uses the shared product card

**Ask:** the product cards under the cart are smaller than normal collection cards;
make them the same size.

**Cause:** that row used a bespoke `rs-card`, not the shared card. It was actually
*wider* than a collection card (287px vs 217px) but its image was a fixed **220px
landscape** box against the real card's **portrait 3:4** — the squat image is what read
as "small", not the width.

Replaced the markup with `{% render 'vamas-product-card' %}` inside `.vamas-prod-grid`,
the same as the collection, homepage, search and product pages, and deleted the
duplicate `rs-*` CSS.

**Verified live**

| | Before | After |
| --- | --- | --- |
| Card | 287 × 353 | 285 × 573 |
| Image | 287 × 220 (landscape) | 283 × 377, aspect **0.750** (3:4) |
| Features | title, price, ADD TO CART | + colour swatches, size chips, wishlist, discount badge |

Phone 375px → 2-up, aspect 0.750, overflow 0. Tablet 1037px → 3-up, aspect 0.750,
overflow 0.

**Caught while checking:** the blanket tablet-and-below rule drops `.vamas-prod-grid` to
2-up. That was fine when the ceiling was 1024, but after moving it to 1180 it left
**469px** cards on a 1022px tablet. Set to 3-up in the tablet band to match the
collection grid; rails stay at 303px, overflow 0.

## 2026-08-13 — Sold-out variants: SOLD OUT + NOTIFY ME

**Ask:** in stock → ADD TO CART + BUY NOW. Sold out → SOLD OUT + a NOTIFY ME button.

BUY NOW and NOTIFY ME now share the slot beside the primary button and swap on variant
change; a disabled BUY NOW previously left a shopper with nothing to do. Also fixed: the
sticky bottom bar still read ADD TO CART on a sold-out variant.

NOTIFY ME opens a modal that posts through **Shopify's own contact form**, so the
request reaches the shop inbox with product, variant and URL attached. No back-in-stock
app is installed and this needs none. After submitting, Shopify returns to
`?contact_posted=true` and the modal reopens itself to show the confirmation.

**Bug found while testing:** the modal was nested inside `{% form 'product' %}`. Browsers
drop a nested form outright, so the contact form rendered as *nothing* and NOTIFY ME
opened an empty box (`formExists: false`). Moved after the product form's `endform`.

**Verified live** on `…elbow-sleeves-saree-blouse-a-66-n` (10 of 12 variants sold out):

| Variant | ADD TO CART | disabled | BUY NOW | NOTIFY ME | sticky bar |
| --- | --- | --- | --- | --- | --- |
| BLACK / M (sold out) | SOLD OUT | yes | hidden | shown | SOLD OUT |
| SILVER / L (in stock) | ADD TO CART | no | shown | hidden | ADD TO CART |

Clicking NOTIFY ME opens the modal with the live variant (`BLACK / M`) and product title
already in the hidden fields; close and Escape both dismiss it. Form posts to
`/contact#notify-form` with `contact[email]`, `contact[Product]`, `contact[Variant]`,
`contact[Product URL]`. No JS errors.

**Not done deliberately:** did not submit the form — that emails the shop owner, so it
is the merchant's to send. Worth one live test.

## 2026-08-13 — Tablet breakpoint raised to 1180px; card price row unstuck

**Ask:** on a tablet the price, struck price and discount were crushed together;
make the three smaller so the card reads cleanly.

**Real cause, and a bug in the earlier tablet fix:** CSS media queries measure the
viewport **including** the scrollbar, while `document.documentElement.clientWidth`
excludes it. The user's tablet reports `clientWidth` 1022 but `innerWidth` **1037** —
above the 1024 ceiling I had used. So every tablet rule was skipped on the real device
and the desktop 4-up grid ran against a 240px sidebar, leaving **149px** cards. At that
width `Rs. 1,312.00` at 18px could not fit on one line, so the price wrapped and shoved
the struck price and discount into it.

Moved all `max-width: 1024px` breakpoints to **1180px** (9 files) so landscape tablets
are actually covered, and gave the price trio a size step between the phone and desktop
values with `nowrap`.

**Measured at innerWidth 1037**

| | Before | After |
| --- | --- | --- |
| Grid | 4 × 148px | 3 × 241px |
| Sidebar | 240px | 168px |
| Price row height | 54px (3 lines) | **23px (1 line)** |
| Price / struck / discount | 18 / 12 / 10 | 15 / 10 / 9 |
| Page overflow | — | 0 |

**Regression checks:** 1400px desktop → 4-up, sidebar 240, 18/12/10, all three side by
side at x = 0 / 86 / 151, overflow 0. 375px phone → 2-up, 12/8/7, x = 0 / 61 / 106,
overflow 0. Desktop and phone untouched.

**Checked, not a bug:** on desktop the price element measures 54px tall. That is
`line-height`, not wrapping — the three sit on one line with room to spare.

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
