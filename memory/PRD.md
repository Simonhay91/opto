# PRD — Optowire Product Catalog (planetworkspace.com)

## Original Problem Statement
Build an SEO-optimized product catalog website using the external REST API at `https://dev.planetworkspace.com/api` with `x-partner-key: 94fa5fc3-9534-4bb5-8722-f724f84a5594`. 

The project uses **Angular 21 with SSR** (no FastAPI backend - direct API calls from Angular). Features: product catalog, product detail pages, blog, partnership form, "Get Quote" functionality, FAQ page.

## Architecture
- **Frontend:** Angular 21 SSR (`/app/frontend/`) — serves at port 3000
- **Backend:** FastAPI (`/app/backend/`) — **TO BE DELETED** (no longer used)
- **External API:** `https://dev.planetworkspace.com/api`
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

### Session 4 (Current — 2026-03-18)
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

## Prioritized Backlog

### P1 — Next Priority
- **FAQ Page Content:** Create proper FAQ content from optowire.net/faq
- **About Us Page Update:** Update content with company information
- **Footer Update:** Add company information

### P2 — Future
- **Delete `/app/backend/`** directory (FastAPI proxy no longer needed)
- **Brand Detail Page:** Dedicated page for brand info and products
- **Enhanced Product Filtering:** Attribute-based filtering (blocked on API returning attribute data)
- **SEO Improvements:** Proper meta tags per page

## Test Status
- **Last tested:** 2026-03-18
- **Test result:** 10/10 PASS
- **Test report:** `/app/test_reports/iteration_2.json`
