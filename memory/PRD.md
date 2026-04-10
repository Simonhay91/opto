# PRD — Optowire Product Catalog (planetworkspace.com)

## Original Problem Statement
Build an SEO-optimized product catalog website using the external REST API at `https://planetworkspace.com/api` with `x-partner-key: 94fa5fc3-9534-4bb5-8722-f724f84a5594`. 

The project uses **Angular 21 with SSR** (no FastAPI backend - direct API calls from Angular). Features: product catalog, product detail pages, blog, partnership form, "Get Quote" functionality, FAQ page.

## Architecture
- **Frontend:** Angular 21 SSR (`/app/frontend/`) — serves at port 3000
- **Backend:** FastAPI (`/app/backend/`) — **TO BE DELETED** (no longer used)
- **External API:** `https://planetworkspace.com/api`
- **API Key interceptor:** `api-key.interceptor.ts` injects `x-partner-key` header
- **Routing:** Slug-based (`/catalog/:categorySlug`, `/product/:slug`)

## Key API Endpoints
- `POST /web/product/explore` — body: `{ page, limit, productName?, categoryId?, sortBy? }`
- `GET /web/category` — returns category tree
- `GET /web/sliders` — homepage slider
- `POST /web/checkout/global-preorder` — "Get Quote" / cart
- `GET /web/section` — homepage sections

## API Parameter Mappings (CRITICAL)
- Search: `productName` (NOT `search`)
- Category filter: `categoryId: number` (NOT `categories: [id]`)
- Sort values: `price_asc`, `price_desc` with underscores (NOT dashes)
- Category by slug: use `getAll()` + flatten tree (NOT `GET /web/category/:slug` — returns 404)

## User Preferences
- Language: **Russian** (respond to user in Russian)
- Brands section: **HIDDEN** (user requested this)

## What's Been Implemented
- Homepage with slider, categories, product sections
- Product catalog with filters (category, search, sort, attributes), pagination
- Product detail page
- Blog + Blog detail page
- FAQ page (needs content)
- Contact / Become Partner form
- About, Terms pages
- "Get Quote" / Cart modal
- HTTP interceptor for x-partner-key
- SSRF-safe `allowedHosts` config in angular.json

## Completed Sessions
### Session 1-3 (Earlier)
- Initial product catalog build
- Homepage slider integration
- "Get Quote" feature
- Category icons, logo sizing, brands section hidden

### Session 4 (2026-03-18)
- **FIXED:** Frontend compilation failure (30+ TypeScript errors in catalog.ts)
- **FIXED:** Duplicate property declarations (signals vs non-signals)
- **FIXED:** Template binding errors (sidebarOpen, categoryBreadcrumb, selectedCategoryId calls)
- **FIXED:** withInterceptorsFromDi() for API key interceptor
- **FIXED:** SSRF allowedHosts for current preview domain
- **FIXED (by testing agent):** CategoryService.getBySlug() now uses tree search instead of /web/category/:slug (404)
- **FIXED (by testing agent):** Search param: `productName` (was `search`)
- **FIXED (by testing agent):** Category filter: `categoryId: number` (was `categories: [id]`)
- **FIXED (by testing agent):** Sort values use underscores: `price_asc` / `price_desc`
- **TESTED:** 10/10 features passing (100%)

### Session 5 (2026-03-19)
- **External API URL changed** from dev to production: `https://api-prod.optowire.net`
- **FIXED:** CORS issue — added proxy at `/ext` in Express server (server.ts)
- **FIXED:** Angular SSR rejecting hostname — added `allowedHosts: ['*.preview.emergentagent.com', ...]` to `AngularNodeAppEngine`
- **FIXED (by testing agent):** Proxy forwarding `Origin`/`Referer` headers causing 401 from external API — removed these headers in proxyReq handler
- **FIXED (by testing agent):** Search param mismatch — header used `?q=` but catalog read `?search=`, now reads both `q` and `search`
- **TESTED:** 8/8 features passing (100%), test report: `/app/test_reports/iteration_4.json`

### Session 6 (2026-03-19)
- **DELETED:** `/app/backend` directory (obsolete FastAPI proxy)
- **SEO:** Added canonical URLs, og:type, og:url, og:image, og:site_name, Twitter Card to all pages via seo.service.ts
- **SEO:** Added FAQ JSON-LD schema (FAQPage) on FAQ page
- **SEO:** Catalog page now sets category-specific SEO title dynamically
- **SEO:** JSON-LD Article schema for blog posts (already existed, confirmed working)
- **SEO:** Default og:image pointing to optowire-logo.png
- **FIX:** about.ts SSR bug — `document` replaced with Angular `DOCUMENT` inject
- **FIX:** footer.html — lowercase `routerlink` attributes fixed to `routerLink`
- **FIX:** index.html — removed hardcoded preview URL, added default og/twitter meta tags

### Session 7 (2026-03-19)
- **FEATURE:** Search-as-you-type in header — debounce 300ms, min 2 chars, dropdown with 6 product results (image + name + brand), click → product page, "View all" → /catalog?q=term, Escape/click-outside to close
- **FIX:** catalog.ts race condition — replaced separate paramMap + queryParamMap subscriptions with `combineLatest` so loadProducts() fires once with all resolved params
- **TESTED:** 8/8 search features PASS (100%), test report: `/app/test_reports/iteration_5.json`

### Session 9 (2026-03-20)
- **Quote form:** Only `email` required; name/company/phone/quantity/message — optional; payload: `{ email, products: Partial<Stock>[], context }`
- **Cart quote form:** Added optional fields (name, company, phone, message); same payload format
- **Favicon:** Added Optowire logo as favicon.png/favicon.ico (served from /public/)
- **Mega-menu:** Add mega-menu with category preview on "Products" hover (user suggested feature)

### P2 — Future
- **Brand Detail Page:** Dedicated page for brand info and products
- **Enhanced Product Filtering:** Attribute-based filtering
- **Search-as-you-type:** Live search suggestions dropdown

## API Notes (Production)
- **API URL:** `https://api-prod.optowire.net`
- **Proxy:** `/ext` path in Express server proxies to API with `x-partner-key` header
- **SSR:** Direct API calls (no proxy needed for server-side)
- **Browser:** Uses `/ext` proxy to avoid CORS
- **Important:** Proxy MUST remove `Origin` and `Referer` headers (API rejects with 401 otherwise)

### Session 10 (2026-03-20)
- **ROOT CAUSE FOUND (P0 CRITICAL):** After proxy migration to FastAPI backend, APIs failing in production with 401
  1. `PARTNER_KEY=catalog-proxy-fix` (WRONG) in `frontend/.env` — fixed to `94fa5fc3-9534-4bb5-8722-f724f84a5594`
  2. `backend/.env` had no `PARTNER_KEY` or `API_BASE_URL` — added both
  3. **Main cause:** FastAPI proxy was forwarding browser `Origin`/`Referer`/`sec-*` headers to external API which rejected them with 401 — fixed by removing these headers in the proxy handler
- **RESULT:** Catalog now shows 1138 products correctly ✅

### Session 11 (2026-03-23) — Current
- **FIXED: Brotli Encoding Bug (P0):** External API responded with Brotli when browser sent `Accept-Encoding: gzip, deflate, br`. FastAPI proxy can't decompress Brotli → frontend got binary instead of JSON. Fixed: force `Accept-Encoding: gzip, deflate` in proxy headers.
- **FIXED: Slider placeholder images** — same root cause. Sliders now show 3 real product images from CDN.
- **FIXED: Mobile Products dropdown** — added accordion with `mobileProductsOpen` signal and all 4 categories.
- **Test result:** 20/20 backend + 8/8 frontend tests PASS ✅

## API Notes (Production — Current Architecture)
- **API URL:** `https://api-prod.optowire.net`
- **Proxy:** `/api/ext/**` in FastAPI backend (`backend/server.py`) proxies to external API
- **CRITICAL #1:** Proxy MUST remove `Origin`, `Referer`, `sec-*` headers (external API rejects with 401)
- **CRITICAL #2:** Proxy MUST force `Accept-Encoding: gzip, deflate` (no Brotli — httpx can't decompress)
- **Keys:** `PARTNER_KEY` and `API_BASE_URL` must be set in `backend/.env`

## Test Status
- **Last tested:** 2026-03-31
- **Test result:** 100% PASS (6/6 frontend) ✅
- **Test report:** `/app/test_reports/iteration_9.json`

### Session 12 (2026-03-31)
- **FIXED: Brand filtering in catalog (P0):** Products from API don't include `brandId`. Now uses server-side `brandId` parameter in `/web/product/explore` for general catalog (no category). Category mode uses brand name matching.
- **FIXED: Brand URL param:** `/catalog?brand=ID` correctly filters products via server-side.
- **FIXED: Brands sidebar visibility:** Brands shown in catalog sidebar regardless of category selection.
- **UI: Brands section (home page):** Removed brand names and "Browse >" buttons. Logos enlarged to w-44 h-44.
- **UI: Brand filter in sidebar:** Changed from multi-select checkboxes to single-select radio buttons (API only supports one brand at a time).
- **UI: Sort By hidden:** Removed "Sort By" dropdown from catalog (no prices on site).
- **FEATURE: Brand on product detail page:** Brand name now displayed with clickable link to filtered catalog. Uses `brand_id` from product API + BrandService lookup.
- **FEATURE: Sitemap (`/sitemap.xml`):** Dynamic XML sitemap generated by FastAPI backend — 610 URLs (6 static + 4 categories + 600 products). Proxied via Angular Express (`server.ts`) at `/sitemap.xml`.
- **FEATURE: robots.txt:** Created at `frontend/src/robots.txt` pointing to `https://optowire.net/sitemap.xml`.
- **BUG FIX (sitemap):** External product API returns HTTP 201 (not 200). Fixed check to accept `200 or 201`.

### Session 13 (2026-04-10)
- **FIXED: Attribute/Spec filters on parent categories (P1):** Parent categories (with children) were showing Specifications filter block derived from mixed subcategory products — confusing and incorrect. Added `showSpecFilters` signal in `catalog.ts`: `false` when selected category has `children.length > 0`, `true` on leaf categories. `extractAttributes()` is now only called for leaf categories. Template guards updated in both desktop and mobile sidebars. Committed and pushed to GitHub (`main`).
- **FIXED: Home page sections now use API section endpoints:** `loadSections()` in `home.ts` was using `explore` with `sortBy: newest` (page 1 & 2) — not real sections. Switched to `GET /web/product/section/{id}`: **section 8 = Top Products (17 products)**, **section 9 = New Arrivals (11 products)**. Sections are managed from planetworkspace admin dashboard and will update automatically on the home page.
- **API NOTE:** `GET /web/section` returns 404 on prod. Use `GET /web/product/section/{id}` with known IDs. Section IDs: `8` = Top Products, `9` = New Arrivals.

### Backlog
- P2: Dynamic Price Range Filter
- P2: Enhanced Mega-menu (image + description on hover)
- P2: Brand Detail Page
