// src/app/core/services/user/user.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

// --- INTERFACES ---
export interface Address {
  _id: string; 
  name: string;      
  address: string;   
  city: string;
  state: string;     
  postalCode: string;
  country: string;
  phone: string;     
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
}

export interface PaymentMethod {
  _id: string;
  type: string;        // 'credit_card', 'debit_card', etc.
  provider: string;    // 'Visa', 'Mastercard'
  cardNumber: string;  // Solo últimos 4 dígitos
  cardHolderName: string;
  expiryDate: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  // Endpoints
  private addressUrl = `${environment.apiUrl}/shipping-address`;
  // Asegúrate de haber creado esta ruta en el backend como vimos antes
  private paymentUrl = `${environment.apiUrl}/payment-methods`; 

  // Subjects (Estado Reactivo)
  private addressesSubject = new BehaviorSubject<Address[]>([]);
  addresses$ = this.addressesSubject.asObservable();

  private paymentsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  payments$ = this.paymentsSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  // ==========================================
  // 📍 1. GESTIÓN DE DIRECCIONES (ADDRESSES)
  // ==========================================

  loadAddresses(): void {
    this.httpClient.get<{ addresses: Address[] }>(this.addressUrl).pipe(
      catchError(error => {
        console.error('Error cargando direcciones:', error);
        return of({ addresses: [] });
      })
    ).subscribe(response => {
      // Si el backend devuelve { addresses: [] } usamos eso, si devuelve array directo, ajustamos.
      // Asumo tu estructura actual:
      this.addressesSubject.next(response.addresses || []);
    });
  }

  addAddress(newAddress: Omit<Address, '_id' | 'isDefault'>): Observable<Address> {
    return this.httpClient.post<{ address: Address }>(this.addressUrl, newAddress).pipe(
      map(response => response.address), 
      tap((savedAddress) => {
        const current = this.addressesSubject.getValue();
        this.addressesSubject.next([...current, savedAddress]);
      }),
      catchError(error => {
        console.error('Error al guardar dirección:', error);
        throw error; // Lanzamos el error para que el componente lo sepa
      })
    );
  }

  removeAddress(addressId: string): Observable<any> {
    return this.httpClient.delete(`${this.addressUrl}/${addressId}`).pipe(
      tap(() => {
        const current = this.addressesSubject.getValue();
        const updated = current.filter(a => a._id !== addressId);
        this.addressesSubject.next(updated);
      })
    );
  }

  // ==========================================
  // 💳 2. GESTIÓN DE PAGOS (PAYMENT METHODS)
  // ==========================================

  loadPaymentMethods(): void {
    // El backend devuelve un array directo [{}, {}]
    this.httpClient.get<PaymentMethod[]>(this.paymentUrl).pipe(
      catchError(error => {
        console.error('Error cargando pagos:', error);
        return of([]); 
      })
    ).subscribe(data => {
      this.paymentsSubject.next(data);
    });
  }

  addPaymentMethod(data: any): Observable<PaymentMethod> {
    // El backend devuelve { message: '...', paymentMethod: {...} } según tu controller nuevo
    return this.httpClient.post<{ paymentMethod: PaymentMethod }>(this.paymentUrl, data).pipe(
      map(res => res.paymentMethod),
      tap((savedPayment) => {
        const current = this.paymentsSubject.getValue();
        this.paymentsSubject.next([...current, savedPayment]);
      }),
      catchError(error => {
        console.error('Error guardando pago:', error);
        throw error;
      })
    );
  }

  removePaymentMethod(id: string): Observable<any> {
    return this.httpClient.delete(`${this.paymentUrl}/${id}`).pipe(
      tap(() => {
        const current = this.paymentsSubject.getValue();
        const updated = current.filter(p => p._id !== id);
        this.paymentsSubject.next(updated);
      })
    );
  }

  getUserProfile(): Observable<any> {
    // Esta ruta debe coincidir con tu backend (router.get('/profile', ...))
    return this.httpClient.get(`${this.baseUrl}/profile`);
  }
}