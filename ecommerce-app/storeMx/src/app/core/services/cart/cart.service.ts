import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Cart } from '../../types/Cart';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = `${environment.apiUrl}/cart`;

  // Inicializamos con null, pero el flujo lo actualizará rápido
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private toastService: ToastService
  ) {
    this.loadCart();
  }

  private getUserId(): string | null {
    return this.authService.decodedToken?.userId ?? null;
  }

  loadCart(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.cartSubject.next(null); // Limpiar si no hay usuario
      return;
    }

    this.getCartByUser(userId).subscribe({
      next: (cart) => {
        console.log('🛒 Carrito cargado:', cart ? `${cart.products.length} productos` : 'Vacío');
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error crítico cargando carrito:', error);
        this.cartSubject.next(null);
      },
    });
  }

  // 🛑 AQUÍ ESTÁ LA MAGIA DEL 404 🛑
  getCartByUser(userId: string): Observable<Cart | null> {
    // NOTA: Idealmente el backend debería leer el ID del token, no de la URL.
    // Pero para la entrega de hoy, lo dejamos así que funciona.
    return this.httpClient.get<Cart>(`${this.baseUrl}/user/${userId}`).pipe(
      catchError((error) => {
        // Si es 404, significa "Usuario Nuevo / Sin Carrito"
        if (error.status === 404) {
          // Devolvemos un "Carrito Virtual Vacío" para que el frontend no sufra
          // Usamos 'as any' para evitar conflictos de tipos estrictos por ahora
          const emptyCart = { products: [], user: userId, totalPrice: 0 } as any;
          return of(emptyCart);
        }
        // Si es otro error (500), sí lo reportamos
        console.error('Error obteniendo carrito:', error);
        return of(null);
      })
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart | null> {
    const userId = this.getUserId();
    if (!userId) {
      this.toastService.error('Inicia sesión para comprar'); // Feedback visual
      return of(null);
    }

    const payload = { userId, productId, quantity };

    return this.httpClient.post(`${this.baseUrl}/add-product`, payload).pipe(
      switchMap(() => {
        // Recargamos el carrito completo para asegurar sincronización
        return this.getCartByUser(userId);
      }),
      tap((updatedCart) => {
        this.toastService.success('Producto agregado al carrito');
        this.cartSubject.next(updatedCart);
      }),
      catchError((err) => {
        this.toastService.error('Error al agregar producto');
        console.error(err);
        return of(null);
      })
    );
  }

  // GETTER: Cantidad de items (Icono rojo del carrito)
  get cartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => {
        if (!cart || !cart.products) return 0; // Protección extra
        return cart.products.reduce((total, item) => total + item.quantity, 0);
      })
    );
  }

  // GETTER: Total a Pagar ($)
  get cartTotalAmount$(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => {
        if (!cart || !cart.products) return 0;
        
        return cart.products.reduce((total, item) => {
          // Manejo robusto de precios (por si viene populated o no)
          const product: any = item.product || item; 
          // A veces el precio está en item.price (si el back lo calcula) o en item.product.price
          const price = product?.price || 0; 
          
          return total + (price * item.quantity);
        }, 0);
      })
    );
  }

  updateProductQuantity(productId: string, quantity: number): Observable<Cart | null> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    const payload = { userId, productId, quantity };
    
    return this.httpClient.put<Cart>(`${this.baseUrl}/update-quantity`, payload).pipe(
      switchMap(() => this.getCartByUser(userId)),
      tap((updatedCart) => this.cartSubject.next(updatedCart))
    );
  }

  removeProductFromCart(productId: string): Observable<Cart | null> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    return this.httpClient.delete<Cart>(`${this.baseUrl}/product/${productId}`, { body: { productId } }).pipe(
      switchMap(() => this.getCartByUser(userId)),
      tap((updatedCart) => {
        this.cartSubject.next(updatedCart);
        this.toastService.success('Producto eliminado');
      })
    );
  }

  clearCartSubject(): void {
    this.cartSubject.next(null);
  }

  clearCart(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    // Llamamos a la ruta DELETE /clear que acabas de crear
    return this.httpClient.delete(`${this.baseUrl}/clear`).pipe(
      tap(() => {
        this.cartSubject.next(null); // Limpiamos el estado visualmente
        this.toastService.success('Carrito vaciado correctamente');
      }),
      catchError((err) => {
        console.error('Error al vaciar carrito', err);
        return of(null);
      })
    );
  }
}