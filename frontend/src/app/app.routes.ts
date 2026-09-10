import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
    title: 'Maison Élégance — Haute Couture & High Craft'
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop').then(m => m.ShopComponent),
    title: 'Sartorial Catalog — Maison Élégance'
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetailComponent),
    title: 'Silhouette Dossier — Maison Élégance'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then(m => m.CartComponent),
    title: 'Atelier Bag — Maison Élégance'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout').then(m => m.CheckoutComponent),
    title: 'White-Glove Checkout — Maison Élégance'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    title: 'Client Sign In — Maison Élégance'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    title: 'Atelier Enrollment — Maison Élégance'
  },
  {
    path: 'account',
    loadComponent: () => import('./features/account/account').then(m => m.AccountComponent),
    canActivate: [authGuard],
    title: 'Client Account — Maison Élégance'
  },
  {
    path: 'content/:key',
    loadComponent: () => import('./features/content-page/content-page').then(m => m.ContentPageComponent),
    title: 'Atelier Gazette — Maison Élégance'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard-home/dashboard-home').then(m => m.DashboardHomeComponent),
        title: 'Executive Overview — Maison Back-Office'
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/admin-products/admin-products').then(m => m.AdminProductsComponent),
        title: 'Catalog Directory — Maison Back-Office'
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/admin-categories/admin-categories').then(m => m.AdminCategoriesComponent),
        title: 'Classification Hierarchy — Maison Back-Office'
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/admin-orders/admin-orders').then(m => m.AdminOrdersComponent),
        title: 'Acquisition Pipeline — Maison Back-Office'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users').then(m => m.AdminUsersComponent),
        title: 'Patron Directory — Maison Back-Office'
      },
      {
        path: 'testimonials',
        loadComponent: () => import('./features/admin/admin-testimonials/admin-testimonials').then(m => m.AdminTestimonialsComponent),
        title: 'Gazette Reviews — Maison Back-Office'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFoundComponent),
    title: 'Page Not Found — Maison Élégance'
  }
];
