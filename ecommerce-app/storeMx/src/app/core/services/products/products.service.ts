import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product, ProductResponse } from '../../types/Products';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export type filters = {
  q: string;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
};

@Injectable({
  providedIn: 'root'
})

export class ProductsService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private httpClient:HttpClient) { }

  getProducts(page: number = 1, limit: number = 10) {
    return this.httpClient
      .get<ProductResponse>(this.baseUrl, { params: { page, limit } })
      .pipe(catchError((error) => throwError(() => new Error(error))));

  }

  getProductByID(id:string):Observable<Product>{
    const url = `${this.baseUrl}/${id}`
    return this.httpClient.get<Product>(`${this.baseUrl}/${id}`);
  }

  searchProducts(searchConfig:filters):Observable<Product[]>{
    let filters:filters ={
      q:searchConfig.q
    }
    if (searchConfig.minPrice) {
      filters.minPrice = searchConfig.minPrice;
    }
    if (searchConfig.maxPrice) {
      filters.maxPrice = searchConfig.maxPrice;
    }
    const params = new HttpParams({fromObject: filters});
    return this.httpClient.get<ProductResponse>(`${this.baseUrl}/search`, {params}).pipe(
      map(response=>{
        return response.products;
      })
    )

  }

   getCheapestProducts(limit: number = 10): Observable<Product[]> {
      const endpoint = `${this.baseUrl}/search`;
  
      const params = new HttpParams()
          .set('sortBy', 'price_asc') 
          .set('limit', limit.toString());
  
      return this.httpClient.get<ProductResponse>(endpoint, { params }).pipe(
        map(response => {
          return response.products; 
        }),
        catchError((error) => {
          console.error('Error al cargar productos más baratos:', error);
          return throwError(() => new Error('Fallo la carga de ofertas.'));
        })
      );
  }
}
