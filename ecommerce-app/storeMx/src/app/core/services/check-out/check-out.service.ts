import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, of, switchMap, take, tap } from 'rxjs';

interface CheckoutData {
  shippingAddressId: string;
  paymentMethodId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CheckOutService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  placeOrder(checkoutData: CheckoutData): Observable<any> {
    return this.cartService.cart$.pipe(
      take(1), 
      switchMap((cart) => {
        
        if (!cart || cart.products.length === 0) {
          console.error('El carrito está vacío. Deteniendo checkout.');
          return of(null);
        }

        const userId = this.authService.decodedToken?.userId;
        if (!userId) {
            console.error('Usuario no autenticado. Deteniendo checkout.');
            return of(null);
        }

        const orderPayload = {
          user: userId,
          products: cart.products.map((item: any) => ({
            productId: item.product._id, 
            quantity: item.quantity,
            price: item.product.price 
          })),
          shippingAddress: checkoutData.shippingAddressId,
          paymentMethod: checkoutData.paymentMethodId,
          shippingCost: 0, 
        };

        return this.http.post(this.baseUrl, orderPayload).pipe(
          tap(() => {
            this.cartService.clearCartSubject(); 
            console.log('¡Compra exitosa! Carrito vaciado.');
          }),
          catchError((error) => {
            console.error('Fallo en el Checkout:', error);
            return of(null);
          })
        );
      })
    );
  }
}
