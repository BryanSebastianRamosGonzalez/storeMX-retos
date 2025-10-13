import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

export type carouselImages =  {
    src: string;
    loaded: boolean;
    loading: boolean;
    alt: string;
    
  }[] 

@Component({
  selector: 'app-carousel',
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() images: carouselImages = [
    { src: 'images/flyers/america.png', loaded: false, loading: false, alt: '',  },
    { src: 'images/flyers/chivas.png', loaded: false, loading: false, alt: '' },
    { src: 'images/flyers/toluca.png', loaded: false, loading: false, alt: '' },
  ];

  @Input() autoPlay: boolean = true;
  @Input() showIndicators: boolean = true;
  @Input() showControls: boolean = true;
  @Input() interval: number = 7000;

  currentIndex = 0;
  private isDestroyed: boolean = false;
  private autoPlayInterval?: number;

  ngOnInit(): void {
    this.loadImage(0);
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('cambios en la configuracion del carousel', changes);
    
    if (changes['images'] && !changes['images'].firstChange) {
      this.currentIndex = 0;
      this.resetLoadedStates();
      this.loadImage(this.currentIndex);
    }
    
    if (changes['autoPlay'] && !changes['autoPlay'].firstChange) {
      if (changes['autoPlay'].currentValue) {
        this.startAutoPlay();
      } else {
        this.stopAutoPlay();
      }
    }
    
    if (changes['interval'] && !changes['interval'].firstChange && this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }
  ngOnDestroy(): void {
    console.log('Componente destruido')
    this.isDestroyed = true;
    this.stopAutoPlay();
    this.cancelPendingImagesLoads()
  }

  loadImage(index: number) {
    if (index < 0 || index >= this.images.length) {
      return;
    }
    if (this.images[index].loaded) {
      return;
    }
    this.images[index].loading = true;
    const img = new Image();
    img.onload = () => {
      console.log(`Imagen ${index + 1} cargada exitosamente`);
      setTimeout(() => {
        this.images[index].loaded = true;
        this.images[index].loading = false;
      }, 1000);
    };
    img.src = this.images[index].src;
  }
  private startAutoPlay() {
    if (this.autoPlay && !this.isDestroyed) {
      this.autoPlayInterval = window.setInterval(() => {
        console.log(this.currentIndex)
        this.nextImage();
      }, this.interval);
    }
  }

  private stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.loadImage(this.currentIndex);

    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.loadImage(nextIndex);
  }
  prevImage() {
    this.currentIndex =
      this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.loadImage(this.currentIndex);

    const prevIndex =
      this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.loadImage(prevIndex);
  }

  private resetLoadedStates() {
    this.images.forEach((image) => {
      image.loaded = false;
      image.loading = false;
    });
  }
  private cancelPendingImagesLoads() {
    this.images.forEach((image) => {
      image.loading = false;
    });
  }
}
