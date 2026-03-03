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
    path: 'catalog/category/:categoryId',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogComponent),
    title: 'Products by Category - Optowire',
  },
  {
    path: 'catalog/brand/:brandId',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogComponent),
    title: 'Products by Brand - Optowire',
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
    path: '**',
    redirectTo: '',
  },
];
