import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home', pathMatch: 'full' },

  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products/products.component').then(
        (c) => c.ProductsComponent
      ),
    title: 'products',
  },
  {
    path: 'product-view/:id',
    loadComponent: () =>
      import(
        './pages/product-detail/product-detail/product-detail.component'
      ).then((c) => c.ProductDetailComponent),
    title: 'product details',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register/register.component').then(
        (c) => c.RegisterComponent
      ),
    title: 'registro',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login/login.component').then(
        (c) => c.LoginComponent
      ),
    title: 'login',
  },
  {
    path: 'user/cart',
    loadComponent: () =>
      import('./pages/cart/cart/cart.component').then((c) => c.CartComponent),
    title: 'Carrito',
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/check-out/check-out/check-out.component').then(
        (c) => c.CheckOutComponent
      ),
    title: 'Finalizar Compra',
    canActivate: [authGuard],
  },
  {
    path: 'order-success/:orderId',
    loadComponent: () =>
      import('./pages/order-success/order-success.component').then(
        (c) => c.OrderSuccessComponent
      ),
    title: 'Orden Exitosa',
    canActivate: [authGuard],
  },
  {
    path: 'user/profile',
    loadComponent: () =>
      import('./pages/user/user-profile/user-profile.component').then(
        (c) => c.UserProfileComponent
      ),
    title: 'Mi Perfil y Dashboard',
    canActivate: [authGuard], 
  },
  {
    path: 'payment-shipping',
    loadComponent: () =>
      import('./pages/payment-shipping/payment-shipping/payment-shipping.component').then(
        (c) => c.PaymentShippingComponent
      ),
    title: 'Pago y Envío',
    canActivate: [authGuard],
  },
];
