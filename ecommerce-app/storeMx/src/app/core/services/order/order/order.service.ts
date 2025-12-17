import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`; 

  constructor(private http: HttpClient) { }

  getOrdersByUserId(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user`).pipe(
      catchError((error) => {
        console.error('Error al cargar historial de órdenes:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }
}