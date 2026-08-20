
# Build Log

## 2026-08-13 — Card size chips: 32-42 only, rest behind a +N

Products run to 44/46/48/50, and half the catalogue still carries M/L/XL/XXL on its SIZE
option from an old import. The card now shows **numeric 32-42 only**; anything above 42
collapses into one `+N` chip linking to the product page, and non-numeric values are
skipped entirely. When a product has no numeric size at all the row is dropped rather
than rendering empty.

**Verified across 5 pages of the served HTML (65 cards):**

| | |
| --- | --- |
| numeric-only size rows | 40 |
| rows showing letter sizes | **0** |
| chips above 42 | **0** |
| cards with no size row (letter-only products) | 25 |
| `+N` chips | +1 ×1, +2 ×5, +3 ×1, +4 ×2 |

One line is structural rather than measured: `flex-wrap: nowrap` with `flex: 1 1 0`
chips, confirmed present in the live CSS, so they shrink instead of wrapping.

**Verification note:** the in-app browser pane was serving a stale cached render
throughout this stretch - still reporting 12 collection badges and the old font weights
after the server had stopped sending them. Everything above was checked against the
served HTML and the exact CSS version the page links, not the pane's DOM.

## 2026-08-13 — Homepage copy, new category set, product card cleanup

**Copy** (all verified live): announce lines are now "LOVED BY 2M+ WOMEN WORLDWIDE" and
"SELLING FAST - 1 BLOUSE / EVERY 60 SECS"; categories heading is "Explore by Category /
Your Dream Blouse is Just a Click Away"; picks heading is "Shop Our Picks / Fresh In,
Loved Always". Both headings were hardcoded in the section and are settings now.

The BLOUSE / KIDS / SHAPEWEAR mobile strip is switched **off**, not deleted, so labels and
URLs survive if it is wanted back.

**Categories** rebuilt to the eight new ones (The Plain Edit ... Corsets). Six existing
tiles were renamed and re-pointed; two new tiles have no image yet.

**Sub-categories are TAGS, not collections.** Tag routes filter server-side with no app,
one product can sit in several sub-categories, and adding one is a tag rather than a
collection to build. Every collection shares one template, so the mapping lives in a
single section setting: one line per collection, `handle | Tag One, Tag Two`. The Plain
Edit carries its seven real sub-categories; the other seven have placeholders.

Verified end to end with a temporary mapping on `/collections/all`: tabs rendered, hrefs
were correct tag routes, and `/collections/all/elbow-sleeves` returned **6 of 100**
products. Found and fixed a case bug while testing - Shopify stores tags as typed
("ELBOW SLEEVES") while the map reads "Elbow Sleeves", so the active tab never
highlighted. Temporary mapping removed.

**Product card**: collection badge and % discount circle removed from the image (their
CSS went too); only the wishlist heart and the rating remain. Text dropped from 700/800
weight and maroon to **400/500 and near-black (#1a1a1a)**. Size chips were wrapping to
two rows, making cards taller than their neighbours - now one `nowrap` row of
`flex: 1 1 0` chips at 9px (8px phones, 9px tablet), so 32-42 cannot wrap at any width.

**Verification note:** the browser pane went unresponsive partway through, and its DOM
reads were showing a cached render (reporting badges still present after they were gone).
Confirmed against the served HTML and the exact CSS version the page links instead:
badge 0, discount circle 0, heart 13, rating 12, name weight 400 / #1a1a1a, price weight
500, `.vamas-prod-card__sizes{flex-wrap:nowrap}`.

## 2026-08-13 — Product page: wishlist and share relocated

**Ask:** move Add to Wishlist next to the NEW ARRIVAL / TRENDING badges, and move
Share + its icons next to the payment badges.

Both done. Wishlist now sits at the end of `.prod-badge-row`, pushed to the right edge
on desktop; Share rides along at the end of `.payment-strip`, so it no longer takes a
centred row of its own.

**Verified live** — desktop 1265px: badge row one line reading `NEW ARRIVAL | 🔥 TRENDING
| ♡ Add to Wishlist` with the wishlist right-aligned; payment strip one line reading
`UPI | Visa | Mastercard | Net Banking | COD | Share: 🔗` with share right-aligned.
Phone 375px: badge row one line (content 329px in a 343px row), strip two lines, page
overflow 0. Wishlist toggle still works (`♡ Add to Wishlist` ↔ `♥ Saved to Wishlist`,
localStorage written and restored) and all its data attributes survived the move; both
share buttons still present.

**Measurement note:** an intermediate check reported the phone badge row as three lines.
That was an artifact — the counter grouped by rounded `top`, and the three items sit at
689/688/693 because their heights differ slightly. Re-measured by vertical overlap it is
one line. A `margin-left: 0` mobile rule added on the strength of the bad reading is
kept, since grouping the wishlist with the badges rather than pushing it 14px right
reads better on a phone either way.

## 2026-08-13 — Hero slide 1 head clipping; size filter status

**Head clipping.** Slide 1's desktop focus-Y was 30. The image is 1600×900 (aspect 1.78)
in a container running 1.98–2.10, so 10–15% of the height is cropped, and at 30 part of
that came off the top — where her head is. Set to **0**: the top edge is pinned and every
lost pixel now comes off the bottom.

Verified: 1920 → 0% off the top (was 3%); 1366 worst case → 0% off the top (was 4.6%).

**Mobile deliberately untouched.** There the square 480×481 image sits in a 0.55 container,
so it crops **horizontally** — 22% off each side, full height visible. focus-Y has no
effect on that axis at all. The fix for mobile is a portrait upload (1200×2100), not a
focus value.

**Size filter — still nothing to filter on.** Measured today:

| URL | Products |
| --- | --- |
| `/collections/all` | 100 |
| `?filter.v.option.size=46` | 100 (no-op) |
| `/collections/all/size-46` | 100 (tag does not exist) |
| `?filter.v.availability=1` | 95 (control — enabled filters do work) |

`productsWithSizeTags: 0 of 100`. The theme already handles all three tiers; what is
missing is store data. The unblocking step is importing `size-tags-import.csv`
(50 products, 334 tags, existing tags preserved) via Products → Import — no connector
needed.

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

## Card gallery: swiping scrolled the strip but never changed the photo

**Symptom (reported repeatedly):** on mobile, swiping left/right on a product
card's image in any grid did nothing.

**Root cause — CSS, not the touch handler.** `.vamas-prod-card__img img` sets
`position: absolute; inset: 0`. That rule also matched the images inside the
swipeable strip, so all five slide images were pinned to the same spot. The
strip genuinely scrolled (measured `scrollLeft = 667`, four slides across) but
every image stayed put, so the visible picture never changed.

Three earlier attempts targeted the touch layer instead and all failed; one of
them (`touchmove` + `preventDefault`, plus `touch-action: pan-y`) actively took
horizontal panning away from the browser and made it worse. Those are reverted.

**Fix:** slide images stay in normal flow — `position: relative; inset: auto`
on `.vamas-prod-card__gallery-slide img`.

**Verified live** (teamgfxbandits, 375px): slide image lefts are 17/184/351/517/684
(previously all 17), and scrolling one viewport width swaps the visible file from
`-HF` to `-HB`. Fixes the dots and the swatch-click image swap too, since both
drive the same scroller. Commit `15f26d8`.

Note: Shopify minifies served CSS, so a comment cannot be used to confirm a
deploy — compare the theme file's `checksumMd5` (Admin API) against the local
file instead.

## Header menu links pointed at the category page, not collections

**Cause: admin navigation data, not theme code.** The header renders whatever
`main_menu` holds. Both header menus (`main-menu-2-header` and its Responsive
copy) still carried demo-theme links: items typed `COLLECTIONS` resolve to
`/collections` (the category/list page) and items typed `FRONTPAGE` resolve to
`/` (the homepage). "All Blouses", "The Plain Edits", "Wedding Wear" and a dozen
others were among them.

**Fix:** rewrote both menus with `menuUpdate`, every shopping item now typed
`COLLECTION` (bound to a real collection by resourceId) or `CATALOG`
(`/collections/all`). No `COLLECTIONS`- or `FRONTPAGE`-typed shopping items
remain; only "Home" still points at `/`.

Mapping applied: Boutique Collection→boutique, The Plain Edits→the-plain-edit,
Our Iconic V-Neck Blouses & V-Neck Collection→classic-v, Stretchable
Blouses→easy-stretch (user's pick over side-stretch), Wedding Wear→bridal,
Festive Weae→festive-glam, Fresh Product Collection & Latest Designs→jackets
(New Arrivals), All Blouses / All Collections / Vikri Kids / More→/collections/all.

**Open:** the "Sale Blouse" tiers (65%/50%/80%/Clearance/Sale) all point at
/collections/all because no sale collections exist yet — user chose this over
removing the menu. "Festive Weae" is a typo in the menu title; left as-is.

## Size filter now actually filters (tag routes, no app needed)

**Cause:** `filter.v.option.size` is silently ignored unless a Size filter is
enabled in Search & Discovery. The store has Color/Price/Availability enabled but
not Size, so the size pills were dead links — proved live: `?filter.v.option.size=44`
returned all 10 products, while `?filter.v.option.color=BLACK` correctly cut 10→5.
There is no Admin API to enable a Search & Discovery filter.

**Fix:** tagged all 50 numeric-size products with `size-32`…`size-50` matching
each product's real SIZE option values, which turns on the theme's already-written
tier-2 path (Shopify's built-in tag routes, server-side, pagination-correct, no app).

Verified on /collections/all: 100 → 50 (size-32) → 12 (size-44) → 5 (size-48)
→ 6 (size-50). On THE PLAIN EDIT: 10 → 2 (size-44) → 0 (size-48, not stocked).

Two bugs fixed alongside:
- The section fell back to `collections.all` whenever `products_count` was 0, so
  a tag route matching nothing showed all 100 products and read as a broken
  filter. It now falls back only when there is genuinely no collection.
- `collection.all_tags` returns only a short slice on /collections/all, so 44-50
  vanished from the row there; that page now takes the row from the size_list
  setting (every numeric size exists somewhere in the catalog).

**Open:** the other 50 products still carry M/L/XL/XXL on their SIZE option, which
the brand does not sell. They carry no size tag, so they never appear under a
numeric size — selecting any size shows at most 50 products until that product
data is corrected. Tags are also product-level, so this filters "offers this size",
not "this size is in stock"; enabling Size in Search & Discovery would upgrade it
to variant-level with no theme change (tier 1 is already written).

## Meaning band: Devanagari headword left, logo right

Swapped what each column carries. The left column, which opened with the logo
image, now opens with the name in Devanagari (`वामस`, editable via a new
`meaning_word_hi` setting). The right column, which showed the word "VAMAS" set
in the heading font, now carries the logo above the BE YOU. BE BEAUTIFUL tagline.

`.vamas-meaning__mark` keeps its own metrics (font-size, letter-spacing,
margin-bottom) so the tagline underneath sits exactly where it did; only an
`img` rule was added inside it. New `.vamas-meaning__word-hi` is sized off the
Latin mark opposite it (46px desktop / 34px phone) rather than off the logo it
replaced, so the two columns read as a matched pair.

**Verified from server output** (curl with the storefront password cookie):
the served homepage has `<div class="vamas-meaning__word-hi" lang="hi">वामस</div>`
on the left and the logo `<img>` inside `__mark` on the right, with zero
remaining `vamas-meaning__logo`; the served CSS carries both new rules and their
768px overrides. The in-app browser kept showing the old markup throughout —
that pane caches the page, so trust curl or the theme checksum, not it.

## Announcement bar wrapped to two lines on phones

The active switch message was `display: block`, so at 375px the closing heart
fell to a second row. It is now a `nowrap` flex row, and under 480px the type
tightens (11px/2px tracking → 9.5px/1px), the hearts shrink 11px → 9px and the
side padding drops 16px → 8px.

**Verified at 375px** (in-app browser, mobile preset): all three messages report
one text line, both hearts share the same `top` (18/18), no horizontal overflow,
and the bar is 33px tall instead of 38px. The longest message now measures 257px
against 359px available — 102px of headroom.

Caveat: `nowrap` means a message longer than that headroom will clip rather than
wrap. Marquee mode is the right choice for anything that long.

## Brand story photo: stock sari portrait replaced with a Vamas shoot

The photo above the "As Seen on Instagram" heading belonged to the OUR STORY
(`.vamas-brand`) section, not the Instagram carousel — and it was not a Vamas
image: `brand_image` pointed at a Freepik file
(`portrait-young-woman-wearing-tradition-sari-garment_52683-90225.avif`).

Cleared `brand_image` and set `brand_image_asset` to `full-look.jpg`, the brand's
own portrait full-look shoot, which is already this setting's theme default and
fits the 500x640 slot.

**Verified from server output:** the served homepage renders
`assets/full-look.jpg` inside `.vamas-brand__image`, and the stock filename no
longer appears anywhere on the page (0 occurrences).

## Promise claims as two-up tiles; meaning band spelling, script and tagline

**Promise strip (phones).** The seven claims were a plain stacked column. They now
sit in a two-column grid of bordered tiles, and an odd last item spans the full
width (`:nth-child(odd):last-child`) so it is not left beside a gap; the rule is
scoped to odd counts so an even list is untouched.
Verified at 375px: three rows of two 167px tiles plus SHIPPING AND DELIVERABLES
at 343px full width, no page overflow.

**Meaning band.**
- Spelling: वामस was missing its long vowel - corrected to वामास.
- Script: the word was set in Poppins, which has no Devanagari, so it fell back to
  a flat system face - that is why it looked off-theme. It now uses Tiro Devanagari
  Sanskrit (same calligraphic contrast as the theme's Playfair Display), italic,
  over the same hairline gold rule already used beside "Noun". Added to the Google
  Fonts link in layout/theme.liquid.
- Tagline: BE YOU. BE BEAUTIFUL is one line (`nowrap`, default no longer carries a
  newline).

Verified: `document.fonts.check('italic 52px "Tiro Devanagari Sanskrit"')` is true
and the computed family is Tiro - the webfont really loads, not a fallback.
Desktop 52px / phone 38px, one line each; tagline one line at both sizes
(123px needed against 327px available at 375px).

Trap: a later `.vamas-meaning__tag { font-size: 12px }` in the same 768px block
would have overridden a new size rule added above it - the existing rule had to be
edited instead of adding another.

Note: the in-app browser served stale HTML for several of these checks (it showed
वामस and the two-line tagline after deploy). Server output via curl is the
authority; where the DOM was stale, the deployed strings were injected before
measuring so the layout numbers reflect what is actually live.

## "Made with Love" lightened; brand image no longer crops the face

**Made with Love** was set in Rubik Dirt, a heavy grunge display face, which read
as a blunt block above the section heading. It now uses the theme's own Playfair
Display in italic at weight 400 (22px desktop / 17px phone). Nothing else used
Rubik Dirt, so its Google Fonts request was dropped from layout/theme.liquid.

**Face crop.** `.vamas-brand__image img` carried `object-position: bottom 5%`,
tuned for the old stock portrait. On the Vamas full-look shoot that removed the
model's head entirely: at 375x220 the image scales to 375x500, so only a 220px
band shows, and `bottom 5%` put that band at source y 766-1400 of 1440 (53-97%)
while her face sits in the top ~18%. Anchored `center top` now.

Verified: served CSS has `object-position:center top`, `.vamas-made-love` computes
to Playfair Display italic 400, and `Rubik+Dirt` appears 0 times in the page.
Cropping full-look.jpg to the exact visible band (top 634px of 1440 on phones,
top 927px on desktop) shows her face and blouse fully in frame.

Note: the in-app browser both served stale HTML and returned blank frames from
`zoom` after DOM mutation, so the crop was verified by computing the band from the
real image dimensions and cropping the file, not by screenshot.

## Meaning band: gold matched to the logo, logo right-aligned on phones, (vama-s)

- **Colour.** The Devanagari word used the theme cream `#EBD3AD` while the logo's
  own ink is `#D0B068` — sampled from vamas-logo.avif, where that shade accounts
  for 1550 of its non-white pixels. The word now uses `#D0B068` so the two match.
  (The logo is a raster asset, so recolouring it was not the reliable direction.)
- **Layout.** On phones the band stacks and the logo column was left-aligned; it
  now takes `align-self: flex-end; text-align: right`, so the logo stays opposite
  the headword as it does on desktop.
- **Pronunciation.** `(vaa · mas)` → `(vama-s)`.

Verified from server output: the page renders `(vama-s)`, the served CSS has
`color:#d0b068` on `.vamas-meaning__word-hi`, and the 768px block carries
`.vamas-meaning__right{align-self:flex-end;text-align:right}`.

## Tagline and "Made with Love" set in Cormorant Garamond

Both reference images are the same classical serif — one upright, one italic — so
both lines now come from one family.

- `.vamas-meaning__tag` had **no font-family of its own**, so it was inheriting the
  body Poppins in italic. It is now upright Cormorant Garamond, weight 500,
  17px desktop / 15px phone.
- `.vamas-made-love` moves from Playfair italic to Cormorant Garamond italic,
  27px desktop / 21px phone. Garamond's small x-height needs the extra point size
  to hold the previous optical size.

Verified at 375px against the live stylesheet: both compute to Cormorant Garamond
(italic 400 for Made with Love, normal 500 for the tagline), the webfont really
loads (`document.fonts.check` true for the italic and the 500 face), each is one
line, the tagline needs 162px of 327px available, and its right edge sits flush
with the band at 351px. No page overflow.

Open: the reference art is sentence case ("Be you. Be Beautiful."); the site copy
is still uppercase. Only the typeface was changed — the wording is the merchant's
call.

## Announcement bar uppercased in CSS; logo moved beside the headword on phones

**Announcement bar.** "100% Vegan Silk" was typed in mixed case while the rest of
the bar is tracked caps. `text-transform: uppercase` on `.vamas-announce` keeps
every message consistent whatever case is typed into the setting, rather than
fixing the one string in settings_data.json.

**Meaning band on phones.** The column stack sent the logo and tagline to the
bottom of the band, away from the word they answer. The mobile band is now a
two-column grid — headword left, logo and tagline right — with the pronunciation
and definition spanning both columns beneath. `display: contents` on
`.vamas-meaning__left` promotes its three children into that grid so the headword
can share a row with `__right` while its siblings still span full width.

Verified at 375px against the live stylesheet:

| check | result |
|---|---|
| inner display / left display | grid / contents |
| grid columns | 93.5px + 219.5px |
| headword and logo column on one row | yes (both top 5837) |
| columns do not overlap | word ends 118, right starts 189 |
| logo flush with the band's right edge | both at 351 |
| pronunciation + definition below both, full width | yes, 327px each |
| tagline still one line | yes |
| page overflow | none |

## Rupee sign, bright rating star, bolder card title, reviews subtitle

- **₹ instead of Rs.** The store's money format is `Rs. {{amount}}`. All 41 money
  filter call sites across 10 files, plus the `shop.money_format` string handed to
  the cart/PDP JS, now map `"Rs. "` to `₹`, so prices read `₹600.00`. Two
  hardcoded `'Rs. '` strings in the price-slider JS were also rewriting the old
  prefix into the labels as the handles moved — fixed.
  **This is storefront-only.** Checkout, order emails and admin still show "Rs."
  because those come from the shop setting (Settings → General → Currency
  formatting), which has no Admin API mutation.
- **Rating star** `#FFC400` instead of `var(--color-gold-dark)` — the muted brand
  gold did not read as a star at 11px over a photo.
- **Card title** 13px/400 → 12px/700.
- **Reviews subtitle** "Over 10,000 happy customers" → "Over 2M+ Happy customers".

Verified from served output: prices render `₹556.15` / `₹440.65` / `₹654.15`,
`rating-badge svg{color:#ffc400}`, `prod-card__name{font-size:12px;font-weight:700…}`,
and `Rs. ` appears 0 times on /collections/all.

Note: the About page timeline still says "Crossed 5,000 happy customers" — left
alone, flagged to the merchant as inconsistent with 2M+.

## Curved footer edge; meaning band reads as two blocks on phones

**Footer wave.** The footer's top edge is now a curve. The SVG paints the page
ground (`--color-bg`) *over* the footer's maroon rather than bulging the maroon
upward — that way it never covers the section above, and one fill works on every
page because both possible predecessors sit on the same `#FEF9F2` (checked: the
homepage tag row, and the FAQ on every other template). 46px desktop / 26px phone,
`preserveAspectRatio="none"` so it stretches to any width.

**Meaning band.** Dissolving only `__left` into the mobile grid left the right
column as one tall cell, so the tagline drifted down level with the pronunciation
and read as a third item floating in the middle. Both wrappers now use
`display: contents`, giving a clean row-for-row split; the 44px decorative rule
after "Noun" is hidden on phones since that row now also carries the tagline.

Verified at 375px against the live stylesheet:

| check | result |
|---|---|
| grid columns | 95px + 218px |
| row 1 — वामास / logo | same row (top 5779), no overlap (95 → 246) |
| row 2 — (vama-s) Noun / tagline | same row (top 5845), no overlap (119 → 189) |
| row 2 below row 1 | yes |
| definition | full width 327px, below both |
| logo and tagline right edges | both flush at 351 |
| decorative rule hidden on phone | yes |
| wave | 26px tall, fill rgb(254,249,242) |
| page overflow | none |
