import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  size: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  
  // Observable para el contador de items
  cartItemCount$ = this.cartItems.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );

  constructor() {
    // Cargar carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }
  }

  getCart() {
    return this.cartItems.asObservable();
  }

  addToCart(product: any, size: string) {
    const currentCart = this.cartItems.value;
    const existingItem = currentCart.find(
      item => item.id === product.id && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentCart]);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        size: size,
        quantity: 1
      };
      this.cartItems.next([...currentCart, newItem]);
    }
    
    this.saveToLocalStorage();
  }

  removeFromCart(itemId: number, size: string) {
    const currentCart = this.cartItems.value;
    const updatedCart = currentCart.filter(
      item => !(item.id === itemId && item.size === size)
    );
    this.cartItems.next(updatedCart);
    this.saveToLocalStorage();
  }

  updateQuantity(itemId: number, size: string, quantity: number) {
    const currentCart = this.cartItems.value;
    const item = currentCart.find(
      item => item.id === itemId && item.size === size
    );
    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentCart]);
      this.saveToLocalStorage();
    }
  }

  clearCart() {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
  }

  private saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  getTotal() {
    return this.cartItems.value.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
  }
} 