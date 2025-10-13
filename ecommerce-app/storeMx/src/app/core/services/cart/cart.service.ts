import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Cart } from '../../types/Cart';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:3000/api/cart';

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private authService: AuthService, 
    private httpClient: HttpClient,
    private toastService: ToastService,

  ) { 
    this.loadCart();
  } 

  get headers(){
    const token = this.authService.token ?? '';
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return headers;
  }

  private getUserId(): string | null {
    const userId = this.authService.decodedToken?.userId;
    return userId ?? null;
  }

  loadCart():void{
    const userId = this.getUserId();
    if (!userId) {
      return;
    }
    //1,3,5,2,4
    this.getCartByUser(userId).subscribe({
      next: (cart)=> this.cartSubject.next(cart),
      error: (error) =>{
        console.log(error);
        this.cartSubject.next(null);
      }
    })
  }
  getCartByUser(userId:string):Observable<Cart | null>{
    return this.httpClient.get<Cart>(`${this.baseUrl}/user/${userId}`, {headers: this.headers} ).pipe(
      catchError((error)=>{
        tap((data)=>{
          console.log(data);
        })
        if (error.status===404) {
          console.log('Carrito no encontrado');
        }
        console.log(error);
        return of(null);
      })
    )
  }

  addToCart(productId: string, quantity: number = 1):Observable<Cart | null>{
    const userId = this.getUserId();
    if (!userId) {
      console.log('User no autentificado');
      return of(null);
    }
    const payload = {
      userId,
      productId,
      quantity
    };
    return this.httpClient.post(`${this.baseUrl}/add-product`, payload, {headers: this.headers}).pipe(
      switchMap(data=>{
        console.log(data);
        return this.getCartByUser(userId);
      }),
      tap((updatedCart)=>{
        this.toastService.success('producto agregado al carrito');
        this.cartSubject.next(updatedCart);
      }
      ) 
    )
  }

  get cartItemCount():Observable<number>{
    return this.cart$.pipe(
      map(cart =>{
        if (!cart || !cart.products) {
          return 0;
        }
        return cart.products.reduce((total, item)=>{
          return total + item.quantity
        }, 0);
      })
    )
  }
}
