import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.page.html',
  styleUrls: ['./payment-success.page.scss']
})
export class PaymentSuccessPage implements OnInit {
  private supabase: SupabaseClient;
  orderDetails: any;
  companyDetails = {
    name: 'Nombre de tu Empresa',
    ruc: '12345678901',
    address: 'Dirección de tu Empresa',
    phone: '123-456-789'
  };
  
  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.orderDetails = navigation.extras.state;
      this.loadOrderDetails(this.orderDetails.orderId);
    }
  }

  async loadOrderDetails(orderId: string) {
    try {
      // Obtener detalles de la orden con productos
      const { data: orderItems, error } = await this.supabase
        .from('order_items')
        .select(`
          *,
          orders (*),
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      if (orderItems) {
        // Actualizar los detalles con la información completa
        this.orderDetails = {
          ...this.orderDetails,
          items: orderItems.map(item => ({
            ...item.products,
            quantity: item.quantity,
            size: item.size,
            price: item.price
          }))
        };
      }
    } catch (error) {
      console.error('Error al cargar los detalles:', error);
    }
  }

  ngOnInit() {
    if (!this.orderDetails) {
      this.router.navigate(['/home']);
    }
  }

  printVoucher() {
    window.print();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
} 