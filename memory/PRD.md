# Optowire Product Catalog — PRD

## Project Overview
Angular Universal SSR product catalog website for **Optowire** (Planet Fiber), a Chinese fiber optic cable manufacturer based in Qingdao, China.  
API: `https://dev.planetworkspace.com/api` — proxied through FastAPI backend.

---

## Architecture
- **Frontend**: Angular 21 with SSR (Angular Universal via `@angular/ssr`)  
  - Runs at port 3000 via `node dist/optowire/server/server.mjs`
  - Full SSR with ld+json structured data for SEO
  - Tailwind CSS for styling
  - Standalone components pattern

- **Backend**: FastAPI (Python) — proxy layer  
  - Runs at port 8001
  - All external API calls proxied with `x-partner-key` header
  - Uses `httpx` for async HTTP

- **DB**: MongoDB (via Motor) — available for future auth/session features

---

## User Personas
- B2B procurement managers seeking fiber optic cables
- Telecom engineers looking for ODN / FTTH components  
- International buyers (English + Chinese language support)

---

## Core Requirements (Static)
1. Angular Universal SSR with ld+json structured data
2. Light/Dark mode toggle
3. English/Chinese (中文) language toggle
4. Product Catalog with sidebar filters (category, brand, search, in-stock)
5. Product Detail page with image gallery, specs table, pricing tiers
6. API integration via FastAPI proxy with `x-partner-key`
7. Mobile responsive design

---

## What's Been Implemented (v1.0 — 2026-03-03)

### Pages
- **Homepage**: Hero slider carousel (API + fallback), feature strip, category grid (real API data), product sections (API with fallback), company about section
- **Product Catalog** (`/catalog`): Sidebar filters (categories, brands, search, in-stock), sort dropdown, product grid, pagination, mobile filter overlay
- **Product Detail** (`/product/:slug`): Image gallery with thumbnails, specs table, pricing tiers, stock status, related products, breadcrumbs

### Shared Components
- **Header**: Logo (from partner API), navigation, search bar, EN/中文 language toggle, dark/light theme toggle, "Get a Quote" CTA, mobile hamburger menu
- **Footer**: Company info, category links, page links, bilingual branding
- **Product Card**: Image, model code, name, stock status, price, "Get Quote" CTA

### SEO
- Angular Universal SSR — full server-rendered HTML
- Organization ld+json schema on homepage
- Product ld+json schema on product detail pages
- CollectionPage schema on catalog pages
- Open Graph meta tags on all pages
- Title + description per page

### Backend Proxy Endpoints
- `GET /api/proxy/web/sliders`
- `GET /api/proxy/web/promotional-unit`
- `GET /api/proxy/web/category`
- `GET /api/proxy/web/brand`
- `POST /api/proxy/web/product/explore`
- `GET /api/proxy/web/product/{slug}`
- `POST /api/proxy/web/product/section/{id}`
- `GET /api/proxy/web/partner/self`
- `GET /api/proxy/web/currency`
- `GET /api/proxy/web/blog/paged`
- Auth endpoints (login, refresh, logout, customer/self)
- `GET /api/health`

---

## Prioritized Backlog

### P0 — Partner Key Setup
- [ ] Add `PARTNER_KEY` to `/app/backend/.env` (user to provide)
- [ ] Test all API endpoints with real partner key

### P1 — Future Releases
- [ ] Customer auth (register, login, profile, addresses)
- [ ] Checkout flow (in-stock order, preorder)
- [ ] Order history
- [ ] Blog pages

### P2 — Enhancements
- [ ] Product search with autocomplete
- [ ] Category attribute filters (attributes per category)
- [ ] Brand detail pages
- [ ] Project inquiry form (`POST /web/project-inquiry`)
- [ ] Become a partner form (`POST /web/become-partner`)
- [ ] Discount policy display
- [ ] Currency switcher
- [ ] Newsletter signup

---

## Next Steps
1. **Provide `PARTNER_KEY`** → Add to `/app/backend/.env` as `PARTNER_KEY=your_key_here` → restart backend
2. Test full product listing, sliders, and sections with real data
3. Implement P1 auth/checkout features
