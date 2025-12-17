import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { OrderService } from '../../../core/services/order/order/order.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserFormsComponent } from '../user-forms/user-forms/user-forms.component';
import { UserService } from '../../../core/services/user/user.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UserFormsComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  activeTab: 'orders' | 'forms' | 'update' = 'forms';
  userCart$: Observable<any> = of(null); 
  userInfo: any = {};
  userOrders$: Observable<any[]> = of([]); 

  profileForm!: FormGroup; 
  ordersLoading = true;  

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService
  ) {
    this.userCart$ = this.cartService.cart$;
  }

 ngOnInit(): void {
    const tokenData: any = this.authService.decodedToken || {};
    
    this.userInfo = {
        name: tokenData.displayName || tokenData.name || 'Usuario',
        email: tokenData.email || 'Correo no disponible',
        userId: tokenData.userId || tokenData._id || tokenData.id
    };

    console.log('✅ Datos procesados para el HTML:', this.userInfo);

    if (this.userInfo.userId) {
        this.orderService.getOrdersByUserId().subscribe({
            next: (orders) => {
                this.userOrders$ = of(orders);
                this.ordersLoading = false;
            },
            error: (err) => {
                this.ordersLoading = false;
                console.error('❌ Error al cargar órdenes (Backend 500):', err);
            }
        });
    } else {
        this.ordersLoading = false;
    }

    this.cartService.loadCart(); 
  }

 setActiveTab(tab: 'orders' | 'forms'): void {
    this.activeTab = tab;
  }
  
  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        this.authService.logout();
    }
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
        console.log('Enviando datos de perfil:', this.profileForm.value);
        alert('Actualización simulada. Debes implementar la llamada a la API.'); 
    }
  }


}
