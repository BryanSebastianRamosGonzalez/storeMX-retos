import { Component, inject, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CarouselComponent } from '../../../components/carousel/carousel/carousel.component';
import { Product } from '../../../core/types/Products';
import { ProductsService } from '../../../core/services/products/products.service';
import { CommonModule } from '@angular/common';

export type carouselImages = {
  src: string;
  loaded: boolean;
  loading: boolean;
  alt: string;
}[];

@Component({
  selector: 'app-home',
  imports: [CarouselComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private productsService = inject(ProductsService);
  indicators: boolean = false;
  autoPlay: boolean = true;
  cheapestProducts$: Observable<Product[]> = of([]);

  flyerImages: carouselImages = [
    {
      src: 'images/flyers/america.png',
      loaded: false,
      loading: false,
      alt: 'Flyer 1',
    },
    {
      src: 'images/flyers/chivas.png',
      loaded: false,
      loading: false,
      alt: 'Flyer 2',
    },
    {
      src: 'images/flyers/toluca.png',
      loaded: false,
      loading: false,
      alt: 'Flyer 3',
    },
  ];

  title: string = '';

  constructor() {
    this.title$
      .pipe(
        map((data) => {
          return data.toDateString();
        })
      )
      .subscribe(this.setTitle);
  }

  ngOnInit(): void {
    const featuredCall = this.productsService.getCheapestProducts(10).pipe(
      catchError((error) => {
        console.error('Error al cargar ofertas:', error);
        return of([]);
      })
    );
    this.cheapestProducts$ = featuredCall;
  }

  private setTitle = () => {
    const date = new Date();
    this.title = `(${date})`;
  };

  title$ = new Observable<Date>((observer) => {
    setInterval(() => {
      observer.next(new Date());
    }, 2000);
  });
}
