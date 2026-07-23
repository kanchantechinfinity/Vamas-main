# Vamas Shopify Theme — Project Memory

Custom Shopify theme for **Vamas** (vamas.in) — a Mumbai-based designer saree-blouse brand. Repo `kanchantechinfinity/Vamas-main`, branch `main`, GitHub-connected to the Shopify theme `Vamas-main/main`. A second store (`teamgfxbandits` / DevStore, handle `yashvmali`) is connected to the **same** GitHub repo/theme.

## Architecture

- **Brand tokens** (single source of truth): `assets/vamas-theme.css` `:root` — `--color-maroon`, `--color-maroon-light`, `--color-gold`, `--color-gold-dark`, `--color-bg`. All editable via **Theme Settings → Colors**. Other CSS files (`vamas-collection.css`, `vamas-product.css`, `vamas-cart.css`, `vamas-contact.css`) alias their own local `--m/--ml/--g/--gd` vars to these instead of hardcoding hex, so the whole site stays one shade of brown.
- **Fonts**: exactly two, `var(--font-heading)` and `var(--font-body)`, set in `layout/theme.liquid` from **Theme Settings → Typography** (`font_picker` for `heading_font`/`body_font`, defaults Playfair Display + Poppins). Every section/snippet uses these vars — no hardcoded font-family should ever be reintroduced.
- **Layout width**: `--page-gutter` (min 48px, matches header) drives consistent side padding across all pages.
- **Custom sections** (all prefixed `vamas-`): homepage, header, footer, about, contact (+ `contact-template` — Shopify auto-created a second template, kept in sync manually), collection, product, cart, blog, article, wishlist, generic-page/404/search.
- **Product card**: `snippets/vamas-product-card.liquid`, used everywhere (home New Arrivals/Best Sellers, collection grid, search). Color swatches read the product's actual **Color/Colour**-named option via `product.options_with_values` (not assumed to be option1), mapped through `snippets/vamas-color-hex.liquid` (fashion color names like "Mustard", "Rani Pink" aren't valid CSS colors — this snippet maps common ones to real hex, falls back to the raw name for standard CSS keywords).
- **Wishlist**: client-side, `localStorage` (`vamas_wishlist_v1`), via `window.VamasWishlist` in `assets/includes.js`. Page at `templates/page.wishlist.json` + `sections/vamas-wishlist.liquid`.
- **Shoppable blog products**: two independent mechanisms in `sections/vamas-article.liquid`, both rendering `snippets/vamas-shop-product.liquid` (compact vertical mini-cards, collection-card style):
  1. **Inline shortcode** — type `[[product:handle]]` anywhere in the article's HTML source (Shopify admin → blog post → Show HTML) to place a product card at that exact spot. Parsed via `snippets/vamas-render-content-with-shortcodes.liquid` (splits on `[[product:`, looks up `all_products[handle]`).
  2. **Blog Post metafield** `custom.featured_products` (List of Products) — editors pick products in the post's Metafields panel; renders as a vertical list positioned after the first `</h2>` (or first `</p>` as fallback), i.e. roughly mid-article. Fully hidden when empty.
  - Metafield *definitions* must be created manually in Shopify Admin → Settings → Custom data → Blog posts (cannot be done from theme code).
- **Homepage**: hero slider (image or video per slide, `video`/`video_url` block settings), trust bar, categories, New Arrivals (8 products, 4-col grid), Full Look banner, Best Sellers (8 products, 4-col grid), Brand Story, Instagram Reels, Testimonials (auto-play carousel, 3/2/1 per view, step-by-card, arrows only — no dots), Browse Tags (moved to just before the footer), footer.
- **Footer**: newsletter → "Shop By" mega-links (Category/Festival/Occasion/Trendsetter, toggle `show_shop_links`) → logo/links grid → bottom bar. Site-wide FAQ accordion renders just above the footer on every page (toggle `show_faq`).
- **Collection page**: sidebar has Occasion/Fabric/Color (tag-based, filter via `/collections/<handle>/<tag>` URL, no Search & Discovery app needed) plus native Price/Availability facets. Sidebar header + Apply Filters button are fixed; only the filter list between them scrolls (`max-height` + `overflow-y`). Price filter is a real dual-handle slider (native inputs overlaid, styled thumbs, JS-synced fill).

## Known gotchas (hard-won, don't repeat)

- **Liquid `contains` is an `{% if %}` operator only — never a pipe filter**, and on at least one store's Liquid engine you **cannot combine a filter with an operator in the same `{% if %}` condition at all** (e.g. `{% if x | downcase contains 'y' %}` fails). Always pre-compute filtered values via `{% assign %}` first, then test the plain variable.
- **CSS color names must be real CSS keywords.** Product option values like "Mustard" or "Rani Pink" silently fail as `background: mustard` (invisible/hollow swatch) — must go through the `vamas-color-hex` mapping snippet.
- **Never `git add -A` blindly when the store's theme editor has been used.** Shopify's GitHub sync pushes editor changes back to the repo; a blanket `add -A` on an unrelated fix has bundled in reverted/regressed templates before (e.g. `article.json`/`blog.json` got switched back to the built-in theme's default sections after an editor edit, silently breaking those pages until caught and reverted).
- **`templates/*.json` files carry a `/* auto-generated */` comment header** once Shopify has round-tripped them — strip it before `python3 -m json.tool` validation (`re.sub(r'/\*.*?\*/','',s,1,flags=re.S)`).
- **Two stores share one GitHub-connected theme** (`Vamas-main/main`) — a push here reaches both `vamas-dumpy`/main store and `teamgfxbandits` DevStore. Sync isn't instant; an empty `git commit --allow-empty` + push can nudge a stalled pull.
- **`security delete-generic-password` and similar destructive/Keychain actions require explicit user confirmation** — the auto-mode classifier blocks them; ask the user to run the command themselves if blocked.
- Shell `head` is aliased to a network HTTP HEAD tool in this environment — use `sed -n` / `python3` slicing instead of `| head`.

## Outstanding — needs real client content (not fake/placeholder)

- **About page**: "Meet Our Team" (Meera Sharma/Priya Nair/Ramesh Kumar) and "Milestones" (2018–2026 timeline, stats 10,000+/500+/15+/4.9★) are still placeholder — no real bios, photos, or founding-year data exist from the client yet. (Real brand history from vamas.in's own About page: founded Mumbai 1960s, not Jaipur 2018 as the placeholder timeline claims — About hero/story copy was already updated with the real vamas.in text, but Team/Milestones blocks were not.)
- **Legal pages** (Privacy Policy, Refund Policy, Terms of Service) — these are Shopify-native Policies (Settings → Policies), not theme files; cannot be set from this repo. Real Refund/Returns policy text was extracted from vamas.in and is available to hand off; Privacy Policy and Terms of Service have no source text yet.
- Real contact details already wired in from vamas.in: phone `+91 95942 83890`, email `support@vamas.in`, address "Shop No. 22, Ground Floor, Neelkanth Business Park, Kirol Road, Vidyavihar (W), Mumbai – 400086", hours "Mon–Sat: 10am–6pm".

## Build log (chronological, major milestones)

1. Homepage, About, Contact, Cart, Collection, Product, Blog, Article, Wishlist custom sections built from scratch matching the static `vamas-main/index.html` reference design (maroon/gold/cream, Playfair Display + Poppins).
2. Header/footer made sticky, responsive (tablet/mobile media queries across all pages), search overlay, wishlist (localStorage), FAQ accordion, marquee-able announcement bar.
3. Homepage hero converted to full-bleed promo banner (image or video per slide); New Arrivals/Best Sellers wired to real collections with placeholder fallback, later bumped to 8 products / 4-col grid.
4. Blog + single-article pages built (featured/latest grid, sticky sidebar, TOC, FAQ dropdowns, shoppable products — both inline shortcode and metafield-driven).
5. Large "don't touch anything else" batch fix: 4-col grid, card rating/swatch/badge fixes, uniform brand color, 2-font enforcement, tag section reorder, testimonial line-clamp, default cart/account icons.
6. Product card color-swatch bug hunted down and fixed twice — first the wrong data source (option1 assumption), then the actual invalid-CSS-color-name root cause, then a Liquid-syntax regression from the first fix, then a second stricter Liquid-engine incompatibility. All resolved; see gotchas above.
7. Collection sidebar price slider rebuilt as a proper dual-handle range slider; Apply Filters pinned with internal scroll.
