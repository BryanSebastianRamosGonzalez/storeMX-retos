import { Component } from '@angular/core';
import { ProductResponse } from '../../../core/types/Products';
import { ProductsService } from '../../../core/services/products/products.service';
import { MatPaginatorModule, PageEvent} from '@angular/material/paginator'
import { PlaceholderComponent } from '../../shared/placeholder/placeholder.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [MatPaginatorModule, PlaceholderComponent, ProductCardComponent, CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  productResponse!: ProductResponse; 

  constructor(private productsService: ProductsService) {} 
  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(page:number=1, limit:number=16){
    this.productsService.getProducts(page, limit).subscribe({
      next:(data)=>{
        console.log(data);
        this.productResponse = data;
      },
      error:(error)=>{
        console.log(error);
      }
    })
  }

  onPageChange(event: PageEvent){
    console.log(event);
    this.getProducts(event.pageIndex + 1, event.pageSize);
  }

  get skeletonArray(): number[] {
    const expectedCount = this.productResponse?.products?.length || 8;
    return Array(expectedCount).fill(0);
  }
  
  retryLoadProducts(): void {
    this.getProducts();
  }
  
}
