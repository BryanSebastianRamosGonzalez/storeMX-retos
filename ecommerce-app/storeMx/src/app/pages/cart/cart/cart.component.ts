import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart/cart.service';
import { Cart } from '../../../core/types/Cart';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cart$: Observable<Cart | null>;
  private cartService = inject(CartService);

  constructor() {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {}

  calculateSubtotal(cart: Cart | null): number {
    if (!cart || !cart.products) return 0;
    
    return cart.products.reduce((acc, item) => {
      const product: any = item.product;
      const price = product.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeProductFromCart(productId).subscribe();
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(productId); 
      return;
    }
    this.cartService.updateProductQuantity(productId, newQuantity).subscribe();
  }

  onClearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      this.cartService.clearCart().subscribe();
    }
  }
}