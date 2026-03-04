# Product Requirements Document (PRD)
# Optowire - Product Catalog Website

**Версия:** 1.0  
**Дата создания:** 4 марта 2026  
**Статус:** Production Ready  
**Проект:** Optowire E-commerce Platform

---

## 1. Обзор проекта

### 1.1 Описание
Optowire - это современная платформа для каталога товаров в сфере телекоммуникаций и оптоволоконного оборудования. Платформа предоставляет удобный способ просмотра, фильтрации и заказа профессионального сетевого оборудования.

### 1.2 Целевая аудитория
- Системные интеграторы
- Телекоммуникационные компании
- Дистрибьюторы оборудования
- Инженеры и технические специалисты
- Малый и средний бизнес

### 1.3 Бизнес-цели
- Увеличение онлайн-продаж оптоволоконного оборудования
- Упрощение процесса заказа для B2B клиентов
- Привлечение новых партнеров
- Улучшение видимости в поисковых системах (SEO)
- Предоставление полной информации о продуктах

---

## 2. Технический стек

### 2.1 Frontend
- **Framework:** Angular 21 с Server-Side Rendering (SSR)
- **Styling:** TailwindCSS
- **State Management:** Angular Signals
- **Build Tool:** Angular CLI + esbuild
- **Storage:** localStorage для корзины

### 2.2 Backend
- **Framework:** FastAPI (Python)
- **Architecture:** Modular (routes, services, models)
- **Database:** MongoDB (Motor async driver)
- **HTTP Client:** httpx для proxy запросов
- **Validation:** Pydantic models

### 2.3 Infrastructure
- **Server:** Node.js (frontend), Python (backend)
- **Proxy:** Backend proxy для external API
- **Process Manager:** Supervisor
- **Hot Reload:** Enabled для development

### 2.4 External API
- **Provider:** Planet Workspace API
- **Base URL:** https://dev.planetworkspace.com/api
- **Authentication:** x-partner-key header
- **Key:** 94fa5fc3-9534-4bb5-8722-f724f84a5594

---

## 3. Архитектура системы

### 3.1 Frontend структура
```
/app/frontend/src/app/
├── core/
│   ├── config/              # Конфигурации (categories, constants)
│   ├── models/              # TypeScript interfaces
│   └── services/            # Angular services
│       ├── api.service.ts
│       ├── product.service.ts
│       ├── category.service.ts
│       ├── brand.service.ts
│       ├── blog.service.ts
│       ├── cart.service.ts
│       ├── partner.service.ts
│       ├── seo.service.ts
│       ├── theme.service.ts
│       └── lang.service.ts
├── pages/
│   ├── home/               # Главная страница
│   ├── catalog/            # Каталог товаров
│   ├── product-detail/     # Детали товара
│   ├── blog/               # Список блогов
│   ├── blog-detail/        # Детали блога
│   ├── brands/             # Страница брендов
│   ├── about/              # О компании
│   ├── contact/            # Контакты
│   └── become-partner/     # Форма партнерства
└── shared/
    ├── header/             # Навигация
    ├── footer/             # Футер
    ├── product-card/       # Карточка товара
    ├── cart-modal/         # Модальное окно корзины
    └── quote-modal/        # Модальное окно запроса КП
```

### 3.2 Backend структура
```
/app/backend/
├── app/
│   ├── main.py             # FastAPI app initialization
│   ├── config.py           # Settings & environment
│   ├── models/
│   │   └── partner.py      # Pydantic models
│   ├── routes/
│   │   ├── products.py     # Product endpoints
│   │   ├── categories.py   # Category endpoints
│   │   ├── brands.py       # Brand endpoints
│   │   ├── blog.py         # Blog endpoints
│   │   └── partner.py      # Partner endpoints
│   └── services/
│       └── proxy.py        # ProxyService class
├── server.py               # Entry point
└── tests/                  # Unit tests
```

---

## 4. Функциональные требования

### 4.1 Навигация и структура

#### 4.1.1 Иерархическая навигация категорий
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**Описание:**
Система многоуровневой навигации по категориям с breadcrumb (хлебными крошками).

**Функции:**
- 4 главные категории с иконками:
  - Telecommunication
  - Network Equipments
  - Security Systems
  - IoT
- Поддержка вложенности до 4+ уровней
- Breadcrumb навигация: "All Categories > Category > Subcategory > ..."
- Клик по breadcrumb возвращает на выбранный уровень
- Кнопка "All Categories" для возврата к корню
- Динамическое отображение подкатегорий
- Иконки категорий (SVG)

**Технические детали:**
- Компонент: `catalog.component.ts`
- Методы: `navigateToCategory()`, `goBackToRoot()`, `onBreadcrumbClick()`
- State: `categoryBreadcrumb`, `currentCategoryLevel`, `allCategoriesData`

#### 4.1.2 Фильтрация товаров
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**Типы фильтров:**
1. **По категориям** - иерархическая навигация
2. **По брендам** - список всех брендов с выбором
3. **По атрибутам** - динамические фильтры SELECTION типа
4. **Поиск** - по названию товара

**Атрибуты фильтров:**
- Загружаются динамически для каждой категории
- Endpoint: `GET /web/category/{slug}/attributes`
- Отображаются как чекбоксы
- Поддержка объектов и строк в `selectionValues`
- Методы: `getAttributeValue()`, `getAttributeValueLabel()`

### 4.2 Каталог товаров

#### 4.2.1 Список товаров
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**Функции:**
- Отображение товаров в сетке (grid)
- Адаптивный layout: 1 колонка (mobile), 2 (tablet), 3 (desktop)
- Пагинация (24 товара на страницу)
- Общее количество результатов
- Сортировка (newest, price, name)
- Lazy loading изображений

**Карточка товара содержит:**
- Изображение товара
- Название
- Краткое описание (если есть)
- Модель / SKU
- Кнопка "+ CART" (добавить в корзину)
- Кнопка "QUOTE" (запрос КП)

**API Endpoint:**
```
POST /api/proxy/web/product/explore
Body: {
  page: number
  limit: number
  productName?: string
  categoryId?: number
  brandId?: number
  selectionAttributeValues?: Array<{id: number, values: string[]}>
}
Response: {
  total: number
  products: Product[]
}
```

#### 4.2.2 Детали товара
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**URL Pattern:** `/product/{full-slug-path}`  
**Пример:** `/product/telecommunication/cable-mounting/tension-clamps/anchor-clamp/optowire-anchor-clamp-s-type-s-type`

**Секции страницы:**
1. **Breadcrumb** - полный путь навигации
2. **Галерея изображений** - множественные фото, zoom
3. **Основная информация:**
   - Название товара
   - Модель / Part Number
   - Категория
   - Бренд
   - Unit (единица измерения)
4. **Tabs:**
   - Description (описание)
   - Specifications (технические характеристики)
   - Downloads (datasheets PDF)
   - Attributes (дополнительные атрибуты)
5. **Quick Specs** - ключевые характеристики
6. **Действия:**
   - ADD TO CART (добавить в корзину)
   - REQUEST A QUOTE (запрос КП)
7. **Related Products** - похожие товары

**Технические детали:**
- SPA навигация через Angular Router
- Подписка на `ActivatedRoute.paramMap`
- Scroll to top при переходе
- SEO: Schema.org Product markup
- Метаданные: title, description, og:tags

### 4.3 Корзина (Shopping Cart)

#### 4.3.1 Функционал корзины
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**Функции:**
- Добавление товаров в корзину
- Изменение количества (+ / -)
- Удаление товаров
- Просмотр общего количества товаров
- Сохранение в localStorage
- Модальное окно корзины (slide-out)

**Cart Service методы:**
- `addToCart(product: ProductDto, quantity: number)`
- `updateQuantity(productId: string, quantity: number)`
- `removeFromCart(productId: string)`
- `clearCart()`
- `getCartItems(): Signal<CartItem[]>`
- `getTotalItems(): Signal<number>`

**Отображение:**
- Иконка корзины в header с badge (количество)
- Slide-out модальное окно справа
- Список товаров с изображениями
- Итоговое количество товаров
- Кнопка "Request Quote for Cart" (запрос КП на всю корзину)

### 4.4 Запрос коммерческого предложения (Quote)

#### 4.4.1 Форма запроса
**Приоритет:** P0  
**Статус:** ✅ Реализовано

**Типы запросов:**
1. **Отдельный товар** - из карточки товара
2. **Вся корзина** - из модального окна корзины

**Поля формы:**
- Name (имя) - required
- Email - required, валидация
- Phone - optional
- Message - optional, автозаполнение списком товаров

**API Endpoint:**
```
POST /api/proxy/web/project-inquiry
Body: {
  name: string
  email: string
  phone?: string
  message: string
}
```

**UX Flow:**
1. Пользователь кликает "REQUEST A QUOTE"
2. Открывается модальное окно с формой
3. Поля частично заполнены (товары в message)
4. Валидация при отправке
5. Success message или error
6. Закрытие модального окна

### 4.5 Блог

#### 4.5.1 Список блогов
**Приоритет:** P1  
**Статус:** ✅ Реализовано

**URL:** `/blog`

**Функции:**
- Сетка блогов (3 колонки desktop)
- Поиск по названию
- Пагинация (12 постов на страницу)
- Карточка блога содержит:
  - Cover image (обложка)
  - Title (заголовок)
  - Excerpt (краткое содержание)
  - Author (автор)
  - Published date (дата публикации)
  - Read time (время чтения)

**API Endpoint:**
```
GET /api/proxy/web/blog/paged?page={page}&limit={limit}&name={search}
```

#### 4.5.2 Детали блога
**Приоритет:** P1  
**Статус:** ✅ Реализовано

**URL:** `/blog/{slug}`

**Секции:**
- Breadcrumb
- Header с gradient background
- Title (H1)
- Meta информация (author, date, read time)
- Cover image (full width)
- Content (HTML контент с prose styling)
- Tags (метки)
- Back to Blog (ссылка назад)

**SEO:**
- Server-Side Rendering (SSR)
- Meta tags: title, description
- Open Graph tags для социальных сетей
- JSON-LD Schema.org Article markup:
  ```json
  {
    "@type": "Article",
    "headline": "...",
    "description": "...",
    "image": "...",
    "datePublished": "...",
    "author": {"@type": "Person", "name": "..."},
    "publisher": {"@type": "Organization", "name": "Optowire"}
  }
  ```

### 4.6 Партнерская программа

#### 4.6.1 Страница "Become Our Partner"
**Приоритет:** P1  
**Статус:** ✅ Реализовано

**URL:** `/become-partner`

**Секции:**
1. **Header** - gradient background, описание программы
2. **Преимущества** - 4 карточки:
   - Exclusive Discounts (эксклюзивные скидки)
   - Marketing Support (маркетинговая поддержка)
   - Priority Support (приоритетная поддержка)
   - Flexible Terms (гибкие условия)
3. **Форма заявки**

**Поля формы:**
- Name (имя) - required
- Email - required, валидация
- Partnership Type - required, select:
  - INDIVIDUAL (индивидуальный)
  - SMALL_BUSINESS (малый бизнес)
  - LARGE_BUSINESS (крупный бизнес)
- Partnership Goal - required, select:
  - DISCOUNT (получить скидки)
  - MARKETING_COLLABORATION (маркетинговое сотрудничество)
  - BULK_ORDERS (оптовые заказы)
  - REFERRALS (реферальная программа)
- Additional Information - optional, textarea

**API Endpoint:**
```
POST /api/proxy/web/become-partner
Body: {
  name: string
  email: string
  message?: string
  partnershipType: "INDIVIDUAL" | "SMALL_BUSINESS" | "LARGE_BUSINESS"
  partnershipAim: "DISCOUNT" | "MARKETING_COLLABORATION" | "BULK_ORDERS" | "REFERRALS"
}
```

**Success Flow:**
- Зеленое сообщение об успехе
- Информация о сроках рассмотрения (2-3 дня)
- Кнопка "Submit Another Application"
- Сброс формы

---

## 5. UI/UX Требования

### 5.1 Дизайн система

**Цветовая палитра:**
- Primary: Cyan (#06B6D4)
- Secondary: Blue (#3B82F6)
- Slate gray для текста и фонов
- Dark mode поддержка

**Типографика:**
- Font семейство: System fonts, JetBrains Mono (code)
- Размеры:
  - H1: text-3xl до text-6xl (responsive)
  - H2: text-base до text-lg
  - Body: text-base (mobile: text-sm)
  - Small: text-xs

**Spacing:**
- Container: max-w-7xl, px-4 md:px-8
- Grid gaps: gap-4 до gap-8
- Section padding: py-8 до py-16

### 5.2 Компоненты

**Header:**
- Логотип Optowire (48px высота)
- Главное меню: Home, Catalog, Brands, Blog, About, Contact
- Поиск (с автодополнением)
- Иконки: Theme toggle, Cart (с badge)
- Sticky header на скролле
- Mobile menu (hamburger)

**Footer:**
- 3 колонки: Company, Products, Support
- Ссылка "Become a Partner" (выделена cyan)
- Social media links
- Copyright
- Dark background (slate-900)

**Product Card:**
- Aspect ratio: square для изображения
- Hover эффект: scale изображения
- Skeleton loader во время загрузки
- Кнопки: + CART, QUOTE

**Buttons:**
- Primary: bg-cyan-500, hover:bg-cyan-600
- Secondary: border + text
- Disabled state: opacity-40, cursor-not-allowed
- Loading state: spinner icon

**Forms:**
- Outline стиль (border)
- Focus state: cyan ring
- Error state: red border + text
- Labels: text-sm, font-medium
- Required fields: red asterisk

### 5.3 Адаптивность

**Breakpoints:**
- Mobile: < 768px (1 колонка)
- Tablet: 768px - 1024px (2 колонки)
- Desktop: > 1024px (3 колонки)

**Mobile UX:**
- Hamburger menu
- Touch-friendly кнопки (min 44px)
- Swipe для галереи
- Bottom sheet модальные окна
- Collapsed filters (accordions)

### 5.4 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- ARIA labels и roles
- Focus indicators
- Alt text для изображений
- Color contrast ratios

---

## 6. SEO требования

### 6.1 Server-Side Rendering (SSR)

**Страницы с SSR:**
- Главная (`/`)
- Каталог (`/catalog`)
- Детали товара (`/product/**`)
- Блог список (`/blog`)
- Детали блога (`/blog/:slug`)
- Статические страницы (about, contact, become-partner)

**Реализация:**
- Angular Universal
- Pre-rendering в `server.ts`
- Render modes: Server для всех страниц

### 6.2 Meta Tags

**Все страницы:**
```html
<title>{Page Title} - Optowire</title>
<meta name="description" content="{Page Description}">
<meta property="og:title" content="{Page Title}">
<meta property="og:description" content="{Description}">
<meta property="og:image" content="{Image URL}">
<meta property="og:type" content="website">
```

**Страница товара:**
```html
<title>{Product Name} - Optowire</title>
<meta name="description" content="{Product Description}">
```

### 6.3 Structured Data (Schema.org)

**Product Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product Description",
  "image": ["image1.jpg", "image2.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
}
```

**Article Schema (Blog):**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article Description",
  "image": "cover-image.jpg",
  "datePublished": "2026-03-04",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Optowire",
    "logo": {
      "@type": "ImageObject",
      "url": "logo.png"
    }
  }
}
```

### 6.4 Performance

**Требования:**
- Lighthouse Score: > 90
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

**Оптимизации:**
- Image lazy loading
- Code splitting
- Tree shaking
- Minification
- Compression (gzip/brotli)
- CDN для статических ресурсов

---

## 7. API Спецификация

### 7.1 Products API

#### Explore Products
```
POST /api/proxy/web/product/explore
Content-Type: application/json

Request Body:
{
  "page": 1,
  "limit": 24,
  "productName": "cable",              // optional
  "categoryId": 1,                     // optional
  "brandId": 5,                        // optional
  "selectionAttributeValues": [       // optional
    {
      "id": 10,
      "values": ["value1", "value2"]
    }
  ]
}

Response: 200 OK
{
  "total": 938,
  "products": [
    {
      "id": 2743,
      "name": "Product Name",
      "slug": "category/subcategory/product-name",
      "model": "MODEL-123",
      "description": "Product description",
      "images": [
        {
          "path": "uuid.webp",
          "path48px": "uuid_48h.webp",
          "path208px": "uuid_208h.webp",
          "path1080px": "uuid_1080h.webp"
        }
      ],
      "category": {...},
      "brand": {...}
    }
  ]
}
```

#### Get Product by Slug
```
GET /api/proxy/web/product/{full-slug-path}
Headers: x-locale-code: en (optional)

Response: 200 OK
{
  "product": {
    "id": 2743,
    "name": "Product Name",
    "slug": "full/path/slug",
    "model": "MODEL-123",
    "description": "Full description",
    "specifications": [
      {"key": "Material", "value": "Aluminum"}
    ],
    "attributes": [
      {"key": "Tension Load", "value": "500N"}
    ],
    "downloads": [
      {"name": "Datasheet", "file": {...}}
    ],
    "images": [...],
    "relatedProducts": [...]
  }
}
```

### 7.2 Categories API

#### Get All Categories
```
GET /api/proxy/web/category
Headers: x-locale-code: en (optional)

Response: 200 OK
[
  {
    "id": 1,
    "name": "Telecommunication",
    "slug": "telecommunication",
    "image": {...},
    "children": [
      {
        "id": 70,
        "name": "ODN Optical Distribution Node",
        "slug": "telecommunication/odn-optical-distribution-node",
        "children": [...]
      }
    ]
  }
]
```

#### Get Category Attributes
```
GET /api/proxy/web/category/{slug-path}/attributes
Headers: x-locale-code: en (optional)

Example: /api/proxy/web/category/telecommunication/odn-optical-distribution-node/attributes

Response: 200 OK
{
  "id": 70,
  "name": "ODN Optical Distribution Node",
  "slug": "telecommunication/odn-optical-distribution-node",
  "description": "Category description",
  "children": [...],
  "attributes": [
    {
      "id": 15,
      "name": "Product Type",
      "type": "SELECTION",
      "selectionValues": ["Type A", "Type B"]
    }
  ],
  "parents": [
    {"id": 1, "name": "Telecommunication", "slug": "telecommunication"}
  ],
  "brands": [...]
}
```

### 7.3 Blog API

#### Get Paginated Blogs
```
GET /api/proxy/web/blog/paged?page=1&limit=12&name=search
Response: 200 OK
{
  "total": 1,
  "entities": [
    {
      "id": 1,
      "name": "Blog Title",
      "slug": "blog-slug",
      "content": "HTML content",
      "summary": "Brief summary",
      "image": {...},
      "author": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "date": "2026-03-04T20:00:00.000Z"
    }
  ]
}
```

#### Get Blog by Slug
```
GET /api/proxy/web/blog/slug/{slug}
Response: 200 OK
{
  "id": 1,
  "name": "Blog Title",
  "slug": "blog-slug",
  "content": "Full HTML content",
  "summary": "Brief summary",
  "image": {...},
  "author": {...},
  "date": "2026-03-04T20:00:00.000Z"
}
```

### 7.4 Partner API

#### Become Partner
```
POST /api/proxy/web/become-partner
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Optional message",
  "partnershipType": "SMALL_BUSINESS",
  "partnershipAim": "BULK_ORDERS"
}

Response: 200 OK
{
  "success": true,
  "message": "Application submitted"
}
```

#### Project Inquiry
```
POST /api/proxy/web/project-inquiry
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Product list or inquiry"
}

Response: 200 OK
{
  "success": true
}
```

---

## 8. Модели данных

### 8.1 TypeScript Interfaces (Frontend)

```typescript
// Product
interface ProductDto {
  id: string | number;
  name: string;
  slug: string;
  model?: string;
  partNumber?: string;
  description?: string;
  unit?: string;
  images?: Image[];
  category?: CategoryDto;
  brand?: BrandDto;
  specifications?: Specification[];
  attributes?: Attribute[];
  downloads?: Download[];
  relatedProducts?: ProductDto[];
}

// Category
interface CategoryDto {
  id: string | number;
  name: string;
  slug?: string;
  image?: Image;
  icon?: string;
  parentId?: string;
  children?: CategoryDto[];
  productCount?: number;
}

// Attribute
interface AttributeDto {
  id: string | number;
  name: string;
  type: 'NUMERIC' | 'TEXT' | 'SELECTION';
  selectionValues?: string[];
}

// Blog
interface BlogDto {
  id: string | number;
  name?: string;
  title?: string;
  slug: string;
  content?: string;
  summary?: string;
  excerpt?: string;
  image?: Image;
  coverImage?: Image;
  author?: any;
  date?: string;
  publishedAt?: string;
  createdAt?: string;
  tags?: string[];
  readTime?: number;
}

// Cart
interface CartItem {
  product: ProductDto;
  quantity: number;
}

// Become Partner
interface BecomePartner {
  name: string;
  email: string;
  message?: string;
  partnershipType: 'INDIVIDUAL' | 'SMALL_BUSINESS' | 'LARGE_BUSINESS';
  partnershipAim: 'DISCOUNT' | 'MARKETING_COLLABORATION' | 'BULK_ORDERS' | 'REFERRALS';
}
```

### 8.2 Pydantic Models (Backend)

```python
# Partner
class BecomePartnerRequest(BaseModel):
    name: str
    email: EmailStr
    message: Optional[str] = None
    partnershipType: Literal['INDIVIDUAL', 'SMALL_BUSINESS', 'LARGE_BUSINESS']
    partnershipAim: Literal['DISCOUNT', 'MARKETING_COLLABORATION', 'BULK_ORDERS', 'REFERRALS']

# Project Inquiry
class ProjectInquiryRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
    phone: Optional[str] = None
```

---

## 9. Конфигурация

### 9.1 Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=full-stack
PARTNER_KEY=94fa5fc3-9534-4bb5-8722-f724f84a5594
API_BASE_URL=https://dev.planetworkspace.com/api
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://product-explorer-4.preview.emergentagent.com
```

### 9.2 Supported Categories

4 главные категории с иконками:
1. **Telecommunication** (id: 1)
2. **Network Equipments** (id: 2)
3. **Security Systems** (id: 3)
4. **IoT** (id: 4)

Конфигурация: `/app/frontend/src/app/core/config/categories.config.ts`

---

## 10. Требования безопасности

### 10.1 API Security
- HTTPS only для production
- CORS настроен для whitelisted domains
- API key (x-partner-key) хранится на backend
- Rate limiting на critical endpoints
- Input validation через Pydantic

### 10.2 Frontend Security
- XSS protection через Angular sanitization
- Content Security Policy (CSP) headers
- No inline scripts
- CSRF protection для форм

### 10.3 Data Privacy
- Email валидация
- Нет хранения sensitive данных на клиенте
- localStorage только для корзины (non-sensitive)

---

## 11. Тестирование

### 11.1 Unit Tests
- Location: `/app/backend/tests/`
- Framework: pytest
- Coverage target: > 80%

### 11.2 E2E Tests
- Tool: Playwright (screenshot tool)
- Critical flows:
  - Product catalog filtering
  - Product detail page
  - Add to cart
  - Request quote
  - Become partner form
  - Blog navigation

### 11.3 Testing Checklist
- ✅ Homepage loads correctly
- ✅ Category navigation (4 levels)
- ✅ Product catalog with filters
- ✅ Product detail page with all data
- ✅ Add to cart functionality
- ✅ Request quote form
- ✅ Blog list and detail pages
- ✅ Become partner form submission
- ✅ Mobile responsive design
- ✅ Dark mode toggle
- ✅ SEO meta tags present

---

## 12. Deployment

### 12.1 Production Requirements
- Node.js 18+ для frontend
- Python 3.11+ для backend
- MongoDB 6.0+
- Nginx для reverse proxy
- SSL certificate

### 12.2 Build Process
```bash
# Frontend
cd /app/frontend
yarn build
# Output: /app/frontend/dist/optowire

# Backend
cd /app/backend
# No build required, Python runs directly
```

### 12.3 Environment Setup
1. Install dependencies: `yarn install` (frontend), `pip install -r requirements.txt` (backend)
2. Configure .env files
3. Start MongoDB
4. Start backend: `python server.py`
5. Start frontend: `node dist/optowire/server/server.mjs`

---

## 13. Мониторинг и логирование

### 13.1 Logs Location
- Backend: `/var/log/supervisor/backend.*.log`
- Frontend: `/var/log/supervisor/frontend.*.log`

### 13.2 Health Checks
- Backend: `GET /api/health` → `{"status": "ok"}`
- Frontend: `GET /` → HTML response

### 13.3 Metrics
- API response times
- Error rates
- User sessions
- Product views
- Cart conversion rate
- Form submissions

---

## 14. Maintenance

### 14.1 Regular Tasks
- Update dependencies (weekly)
- Review error logs (daily)
- Database backups (daily)
- Performance monitoring (continuous)
- Security patches (as needed)

### 14.2 Known Limitations
- MongoDB для данных корзины не используется (только localStorage)
- Аутентификация пользователей не реализована
- Checkout процесс не реализован (только Request Quote)
- Админ панель отсутствует (используется external API)

---

## 15. Будущие улучшения (Roadmap)

### Phase 2 (P2 - Optional)
- [ ] Страница деталей бренда
- [ ] Обновление контента (О нас, главная, футер)
- [ ] Расширенная аналитика
- [ ] Wishlist (избранное)
- [ ] Сравнение товаров
- [ ] Product reviews и ratings

### Phase 3 (Future)
- [ ] Полная система аутентификации
- [ ] Checkout процесс с оплатой
- [ ] История заказов
- [ ] Профиль пользователя
- [ ] Multi-language support (полный)
- [ ] Mobile app (iOS/Android)

---

## 16. Глоссарий

- **SSR** - Server-Side Rendering
- **SPA** - Single Page Application
- **PWA** - Progressive Web App
- **B2B** - Business to Business
- **KP/Quote** - Коммерческое предложение
- **ODN** - Optical Distribution Node
- **SKU** - Stock Keeping Unit
- **CRUD** - Create, Read, Update, Delete

---

## 17. Контакты и ресурсы

**External API Documentation:**
- Base URL: https://dev.planetworkspace.com/api
- Partner Key: 94fa5fc3-9534-4bb5-8722-f724f84a5594

**Project Repository:**
- Frontend: `/app/frontend`
- Backend: `/app/backend`

**Live URL:**
- Production: https://product-explorer-4.preview.emergentagent.com

---

**Статус документа:** Production Ready  
**Последнее обновление:** 4 марта 2026  
**Версия:** 1.0  
**Составитель:** Development Team
