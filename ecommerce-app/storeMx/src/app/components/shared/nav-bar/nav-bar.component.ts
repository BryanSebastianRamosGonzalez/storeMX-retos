import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminDirective } from '../../../core/directives/admin/admin.directive';

export interface routeItem {
  title: string;
  route: string;
}

@Component({
  selector: 'app-nav-bar',
  standalone: true, 
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, RouterModule, AdminDirective], 
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
  
  isMenuOpen: boolean = false; 
  searchTerm: string = '';

  @Input() title?: string;
  
  navRoutes: routeItem[] = [
    { title: 'Inicio', route: '/' },
    { title: 'Productos', route: '/products' },
  ];

  userRoutes: routeItem[] = [
    { title: 'Mi Perfil', route: '/user/profile' },
    { title: 'Carrito', route: '/user/cart' },
   
  ];

  adminRoutes: routeItem[] = [
          
  ];
  
  private authService = inject(AuthService);
  isLoggedIn$: Observable<boolean>;

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  onSearch() {
    if (this.searchTerm.trim()) {
        console.log('Búsqueda enviada:', this.searchTerm);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}