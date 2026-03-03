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
    path: '**',
    redirectTo: '',
  },
];
