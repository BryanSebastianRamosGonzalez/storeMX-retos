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
  private baseUrl = `${environment.apiUrl}/products`;//esto es lo que se cambio para usar las variables de entorno 

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
      // Define la URL completa para el endpoint de búsqueda
      const endpoint = `${this.baseUrl}/search`;
  
      // Crea los parámetros de consulta HTTP:
      // - sortBy=price_asc: ordena por precio ascendente
      // - limit: número máximo de productos a retornar
      const params = new HttpParams()
          .set('sortBy', 'price_asc') 
          .set('limit', limit.toString());
  
      // Realiza la petición GET HTTP con los parámetros configurados
      return this.httpClient.get<ProductResponse>(endpoint, { params }).pipe(
        // Transforma la respuesta para extraer solo el array de productos
        map(response => {
          return response.products; 
        }),
        // Maneja cualquier error que ocurra durante la petición
        catchError((error) => {
          // Registra el error en la consola
          console.error('Error al cargar productos más baratos:', error);
          // Retorna un nuevo error con mensaje personalizado
          return throwError(() => new Error('Fallo la carga de ofertas.'));
        })
      );
  }
}
