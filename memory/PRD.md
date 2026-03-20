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

### P1 — Next Priority
- **FAQ Page Content:** Create proper FAQ content from optowire.net/faq (page exists but may need content update)
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

### Session 8 (2026-03-20)
- **FIXED (P0 CRITICAL):** Product catalog returning 500 — two root causes:
  1. `PARTNER_KEY` in `frontend/.env` was wrong (`eqp-showcase` → `94fa5fc3-9534-4bb5-8722-f724f84a5594`)
  2. Start script didn't load `.env` into `process.env` — fixed by using `node --env-file=.env dist/optowire/server/server.mjs`
- **RESULT:** Catalog now shows 1138 products ✅

## Test Status
- **Last tested:** 2026-03-20
- **Test result:** Catalog proxy confirmed working (HTTP 201, 5 products returned via curl) + screenshot showing 1138 products
- **Test report:** `/app/test_reports/iteration_7.json` (previous), manual curl + screenshot (current)
