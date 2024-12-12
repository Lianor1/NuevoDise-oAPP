import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-size-selector',
  template: `
    <ion-content class="ion-padding">
      <!-- Imagen del producto -->
      <div class="product-header">
        <img [src]="product.image_url" [alt]="product.name">
        <div class="product-info">
          <h2>{{product.name}}</h2>
        </div>
      </div>

      <!-- Selector de tallas -->
      <div class="size-section">
        <h3>Selecciona tu talla</h3>
        <div class="size-grid">
          <div *ngFor="let size of product.size" 
               class="size-box"
               [class.selected]="selectedSize === size"
               (click)="selectSize(size)">
            <span>{{size}}</span>
          </div>
        </div>
      </div>

      <!-- Botón de acción -->
      <ion-button expand="block" 
                  class="add-button" 
                  [disabled]="!selectedSize"
                  (click)="confirm()">
        <ion-icon name="bag-add-outline" slot="start"></ion-icon>
        Agregar al carrito
      </ion-button>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .product-header {
      margin: -16px -16px 20px -16px;
      position: relative;
      
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .product-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px 16px;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        color: white;
        
        h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .price {
          margin: 5px 0 0;
          font-size: 1.2rem;
          font-weight: 500;
          color: var(--ion-color-primary);
        }
      }
    }

    .size-section {
      h3 {
        font-size: 1.1rem;
        color: #333;
        margin-bottom: 20px;
        font-weight: 600;
      }
    }

    .size-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }

    .size-box {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ddd;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.2s ease;
      background: white;
      
      &.selected {
        background: var(--ion-color-primary);
        border-color: var(--ion-color-primary);
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .add-button {
      margin-top: 20px;
      --border-radius: 12px;
      height: 52px;
      font-size: 1.1rem;
      font-weight: 600;
      --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
      
      ion-icon {
        font-size: 20px;
        margin-right: 8px;
      }
    }
  `]
})
export class SizeSelectorComponent {
  @Input() product: any;
  selectedSize: string = '';

  constructor(private modalCtrl: ModalController) {}

  selectSize(size: string) {
    this.selectedSize = size;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    this.modalCtrl.dismiss({
      size: this.selectedSize
    });
  }
} 