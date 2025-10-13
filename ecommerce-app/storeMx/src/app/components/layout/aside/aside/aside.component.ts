import { Component } from '@angular/core';
import { AuthService, decodedToken } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { routeItem } from '../../../side-bar/menu-item/menu-item/menu-item.component';
import { SideMenuComponent } from '../../../side-bar/side-menu/side-menu/side-menu.component';

@Component({
  selector: 'app-aside',
  imports: [CommonModule, SideMenuComponent],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent {
  sideBarOpen: boolean = false;

  routes: routeItem[] = [
    { title: 'Inicio', route: '', textColor:'text-green-200'},
    { title: 'Productos', route: '/products' },
    { title: 'Categorias', route:'/categories'}
  ];
  
  adminRoutes: routeItem[]=[
    { title: 'Productos', route: '/admin/products' },
    { title: 'Usuarios', route: '/admin/users' },
    { title: 'Categorias', route: '/admin/categories' },
    { title: 'Compras', route: '/admin/purchases' },
  ]

  authRoutes:routeItem[]=[
    { title: 'mi perfil', route: '/user' },
    { title: 'mi carrito', route:'/user/cart'}
  ]

  notAuthRoutes: routeItem[]=[
    { title: 'iniciar sesion', route: '/login' },
    { title: 'registro', route:'/register'}
  ]
  user: decodedToken | null = null;

  constructor(private authService: AuthService){
    
  }

  ngOnInit(): void {
    this.user = this.authService.decodedToken;
    console.log(this.user)
  }
}
