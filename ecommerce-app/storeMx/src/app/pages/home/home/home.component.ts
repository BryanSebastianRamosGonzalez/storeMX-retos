import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CarouselComponent } from '../../../components/carousel/carousel/carousel.component';

@Component({
  selector: 'app-home',
  imports: [CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  indicators:boolean = false;
  autoPlay: boolean = true;

  title: string ='';

  constructor(){
    this.title$.pipe(
      map(data=>{
        return data.toDateString()
      }
      )
    ).subscribe(this.setTitle)
  }

  private setTitle= ()=>{
    const date = new Date();
    this.title = `(${date})`
  }

  title$ = new Observable<Date>((observer)=>{
    setInterval(()=>{
      observer.next(new Date())
    }, 2000)
  })
}
