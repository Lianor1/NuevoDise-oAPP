import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  size: string;
  quantity: number;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total$: Observable<number>;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    // Inicializar observables
    this.cartItems$ = this.cartService.getCart();
    this.total$ = this.cartService.getCart().pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }

  ngOnInit() {
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.id, item.size, newQuantity);
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id, item.size);
  }

  checkout() {
    // Por ahora solo navegaremos a home
    console.log('Iniciando proceso de checkout...');
    // this.router.navigate(['/checkout']);
  }
}
