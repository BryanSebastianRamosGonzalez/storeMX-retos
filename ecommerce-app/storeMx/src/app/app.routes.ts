import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products/products.component').then(
        (c) => c.ProductsComponent
      ),
    title: 'products',
  },
];
