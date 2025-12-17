import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../core/services/cart/cart.service';
import { Router, RouterModule } from '@angular/router';
import { CheckOutService } from '../../../core/services/check-out/check-out.service';
import { UserService } from '../../../core/services/user/user.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css',
})
export class CheckOutComponent implements OnInit {
  cart$!: Observable<any>;
  
  savedAddresses: any[] = [];
  savedCards: any[] = [];

  selectedAddressId: string = '';
  selectedPaymentMethodId: string = '';

  isLoadingProfile = true;

  constructor(
    private checkoutService: CheckOutService,
    private cartService: CartService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart();
    this.cart$ = this.cartService.cart$;
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (response: any) => {
        console.log('🔥 PERFIL RECIBIDO:', response);

        const user = response.user || response; 

        this.savedAddresses = user.shippingAddresses || user.addresses || [];
        this.savedCards = user.paymentMethods || user.cards || [];

        console.log('📍 Direcciones cargadas:', this.savedAddresses);
        console.log('💳 Tarjetas cargadas:', this.savedCards);

        if (this.savedAddresses.length > 0) {
          this.selectedAddressId = this.savedAddresses[0]._id;
        }
        if (this.savedCards.length > 0) {
          this.selectedPaymentMethodId = this.savedCards[0]._id;
        }
        
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.error('❌ Error perfil:', err);
        this.isLoadingProfile = false;
      }
    });
  }

  selectAddress(id: string) {
    this.selectedAddressId = id;
  }

  selectCard(id: string) {
    this.selectedPaymentMethodId = id;
  }

  finalizarCompra() {
    if (!this.selectedAddressId) {
      this.toastService.error('⚠️ Selecciona una dirección');
      return;
    }
    if (!this.selectedPaymentMethodId) {
      this.toastService.error('⚠️ Selecciona un método de pago');
      return;
    }
    
    const checkoutData = {
      shippingAddressId: this.selectedAddressId,
      paymentMethodId: this.selectedPaymentMethodId,
      shippingAddress: this.selectedAddressId,
      paymentMethod: this.selectedPaymentMethodId
    };

    console.log("🚀 Enviando orden:", checkoutData);

    this.checkoutService.placeOrder(checkoutData).subscribe({
      next: (response) => {
        if (response && response.order && response.order._id) {
          this.toastService.success('¡Pedido Exitoso!');
          this.cartService.clearCartSubject(); 
          this.router.navigate(['/order-success', response.order._id]);
        }
      },
      error: (err) => {
        console.error('❌ Error Checkout:', err);
        const msg = err.error?.message || err.error?.error || 'Error desconocido al procesar pago';
        this.toastService.error(msg);
      },
    });
  }

  calculateSubtotal(products: any[]): number {
    if (!products) return 0;
    return products.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }
}