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
        
        // **Validación de seguridad Front-end**
        if (!cart || cart.products.length === 0) {
          console.error('El carrito está vacío. Deteniendo checkout.');
          return of(null);
        }

        // Obtener ID del usuario (asumiendo que el token decodificado tiene el userId)
        const userId = this.authService.decodedToken?.userId;
        if (!userId) {
            console.error('Usuario no autenticado. Deteniendo checkout.');
            return of(null);
        }

        // 2. CONSTRUCCIÓN DEL PAYLOAD (Formato exacto que tu createOrder de Node espera)
        const orderPayload = {
          user: userId,
          products: cart.products.map((item: any) => ({
            // Estos tres campos son los que tu Back-end espera para cada ítem de producto
            productId: item.product._id, 
            quantity: item.quantity,
            price: item.product.price 
          })),
          // Estos campos vienen de la interfaz CheckoutData (los datos finales del formulario)
          shippingAddress: checkoutData.shippingAddressId,
          paymentMethod: checkoutData.paymentMethodId,
          shippingCost: 0, 
        };

        // 3. LLAMADA FINAL HTTP (POST /api/orders)
        return this.http.post(this.baseUrl, orderPayload).pipe(
          tap(() => {
            // 4. LIMPIEZA: Vaciar el carrito localmente después del éxito
            // Necesitarás un método simple en tu CartService para hacer esto.
            this.cartService.clearCartSubject(); 
            console.log('¡Compra exitosa! Carrito vaciado.');
          }),
          catchError((error) => {
            // Manejo de errores de pago o de Back-end
            console.error('Fallo en el Checkout:', error);
            return of(null);
          })
        );
      })
    );
  }
}
