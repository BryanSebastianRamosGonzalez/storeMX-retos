import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart/cart.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

interface ShippingOption {
  id: number;
  name: string;
  cost: number;
  estimatedDays: number;
}

@Component({
  selector: 'app-payment-shipping',
  imports: [CommonModule, FormsModule, CurrencyPipe, ],
  templateUrl: './payment-shipping.component.html',
  styleUrl: './payment-shipping.component.css',
})
export class PaymentShippingComponent implements OnInit {
  cartTotal$!: Observable<number>;
  cartTotal: number = 0;

  shippingOptions: ShippingOption[] = [
    { id: 1, name: 'Envío Estándar (3-5 días)', cost: 10.0, estimatedDays: 5 },
    { id: 2, name: 'Envío Express (1-2 días)', cost: 25.0, estimatedDays: 2 },
    { id: 3, name: 'Recoger en Tienda (Hoy)', cost: 0.0, estimatedDays: 0 },
  ];

  selectedShippingCost: number = 0;
  finalTotal: number = 0;

  paymentDetails = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  };

  constructor(private cartService: CartService, private router: Router) {} 

  ngOnInit(): void {
    this.cartTotal$ = this.cartService.cartTotalAmount$;
    this.cartTotal$.subscribe((total) => {
      this.cartTotal = total;
      this.calculateFinalTotal();
    });
  }

  onShippingSelected(cost: number): void {
    this.selectedShippingCost = cost;
    this.calculateFinalTotal();
  }

  calculateFinalTotal(): void {
    this.finalTotal =
      Math.round((this.cartTotal + this.selectedShippingCost) * 100) / 100;
  }

  processOrder(): void {
    console.log('TOTAL FINAL REAL:', this.finalTotal);
    alert(`Orden de ${this.finalTotal.toFixed(2)} procesada.`);
    this.router.navigate(['/user/profile'])
  }
}
