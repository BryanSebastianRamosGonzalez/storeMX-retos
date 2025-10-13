import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { ProductsService } from '../../../../core/services/products/products.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit{
  searchProductForm = new FormGroup({
    q: new FormControl('', {nonNullable: true}), 
    minPrice: new FormControl(1000, {nonNullable:true}),
    maxPrice: new FormControl(3000, {nonNullable:true})
  })

  searchConfig$ = this.searchProductForm.valueChanges.pipe(
    debounceTime(300),
    // distinctUntilKeyChanged('q'),
    distinctUntilChanged((prevValue,newValue)=>{
      return prevValue === newValue
    }),
    map((config)=>{
      const trimmedConfig ={
        ...config,
        q: config.q?.trim() || ''
      }
      localStorage.setItem('searchConfig', JSON.stringify(trimmedConfig))
      return trimmedConfig;
    })
  );

  products$ = this.searchConfig$.pipe(
    switchMap((searchConfigObservable)=>this.productService.searchProducts(searchConfigObservable))
  )


  constructor(private productService: ProductsService){}
  ngOnInit(): void {
    this.searchConfig$.subscribe({next: data => console.log(data)});
  }

}
