import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    title: 'Optowire - Fiber Optic & Network Equipment',
  },
  {
    path: 'catalog',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogComponent),
    title: 'Product Catalog - Optowire',
  },
  {
    path: 'catalog/:categorySlug',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogComponent),
    title: 'Products by Category - Optowire',
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent),
    title: 'Contact Us - Optowire',
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsComponent),
    title: 'Terms & Conditions - Optowire',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent),
    title: 'About Optowire',
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/brands/brands').then(m => m.BrandsComponent),
    title: 'Our Brands - Optowire',
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.BlogComponent),
    title: 'Blog - Optowire',
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetailComponent),
  },
  {
    path: 'become-partner',
    loadComponent: () => import('./pages/become-partner/become-partner').then(m => m.BecomePartnerComponent),
    title: 'Become Our Partner - Optowire',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then(m => m.FaqComponent),
    title: 'FAQ - Optowire',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
