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
  orderDetails: any = {
    total: 0,
    items: [],
    date: new Date(),
    orderId: '',
    paymentMethod: ''
  };
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
      // Asignar los valores iniciales del state
      this.orderDetails = {
        ...this.orderDetails,
        ...navigation.extras.state,
        total: Number(navigation.extras.state['total']) || 0 // Asegurar que total sea número
      };
      console.log('Order Details:', this.orderDetails); // Para debugging
      this.loadOrderDetails(this.orderDetails.orderId);
    }
  }

  async loadOrderDetails(orderId: string) {
    try {
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Obtener detalles de la orden con productos
      const { data: orderItems, error } = await this.supabase
        .from('order_items')
        .select(`
          *,
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
        // Calcular el total basado en los items
        const total = orderItems.reduce((sum, item) => 
          sum + (item.quantity * item.price), 0);

        // Actualizar los detalles con la información completa
        this.orderDetails = {
          ...this.orderDetails,
          total: total,
          items: orderItems.map(item => ({
            ...item.products,
            quantity: item.quantity,
            size: item.size,
            price: item.price
          }))
        };

        console.log('Updated Order Details:', this.orderDetails); // Para debugging
      }
    } catch (error) {
      console.error('Error al cargar los detalles:', error);
    }
  }

  ngOnInit() {
    if (!this.orderDetails?.orderId) {
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