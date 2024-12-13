import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.page.html'
})
export class ConfirmationPage {
  private supabase: SupabaseClient;
  paymentMethod: string = 'default';
  orderTotal: number = 0;
  totalAmount: number = 0;
  isProcessing: boolean = false;
  cartItems: any[] = [];
  orderNumber: string = new Date().getTime().toString().slice(-8);
  currentDate: Date = new Date();

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private cartService: CartService
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.paymentMethod = navigation.extras.state['paymentMethod'];
    }
    this.loadCartItems();
  }

  async loadCartItems() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.orderTotal = this.cartService.getTotal();
    });
  }

  async confirmPayment() {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago...'
    });
    await loading.present();

    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError) throw userError;

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: this.orderTotal,
          status: 'completed',
          shipping_address: 'Recojo en tienda'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order Error:', orderError);
        throw orderError;
      }

      const orderItems = this.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      this.cartService.clearCart();
      
      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: '¡Pago confirmado exitosamente!',
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      this.router.navigate(['/payment-success'], {
        state: {
          orderId: order.id,
          total: this.orderTotal,
          items: this.cartItems,
          paymentMethod: this.getPaymentMethodName(),
          date: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error:', error);
      await loading.dismiss();
      
      const toast = await this.toastCtrl.create({
        message: 'Error al procesar el pago. Por favor, intente nuevamente.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  getPaymentMethodIcon() {
    switch(this.paymentMethod) {
      case 'card': return 'card-outline';
      case 'yape': return 'phone-portrait-outline';
      case 'plin': return 'phone-portrait-outline';
      case 'cash': return 'cash-outline';
      default: return 'wallet-outline';
    }
  }

  getPaymentMethodName() {
    switch(this.paymentMethod) {
      case 'card': return 'Tarjeta de Crédito/Débito';
      case 'yape': return 'Yape';
      case 'plin': return 'Plin';
      case 'cash': return 'Efectivo';
      default: return 'Método de pago';
    }
  }

  cancelPayment() {
    this.router.navigate(['/payment']);
  }

  rateProduct(item: any, rating: number) {
    item.rating = rating;
    this.saveRating(item.id, rating);
  }

  async saveRating(productId: string, rating: number) {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError) throw userError;

      const { error } = await this.supabase
        .from('product_ratings')
        .upsert({
          product_id: productId,
          user_id: user?.id,
          rating: rating,
          created_at: new Date()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  }

  increaseQuantity(item: any) {
    item.quantity++;
    this.updateTotalAmount();
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateTotalAmount();
    }
  }

  removeItem(item: any) {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      this.updateTotalAmount();
    }
  }

  updateTotalAmount() {
    this.totalAmount = this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }
}
