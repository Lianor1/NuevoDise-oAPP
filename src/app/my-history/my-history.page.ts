import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-history',
  templateUrl: './my-history.page.html',
  styleUrls: ['./my-history.page.scss']
})
export class MyHistoryPage implements OnInit {
  private supabase: SupabaseClient;
  orders: any[] = [];
  isLoading: boolean = false;

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  ngOnInit() {
    this.loadOrders();
  }

  // Método para calcular el total gastado
  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total_amount, 0);
  }

  async loadOrders() {
    this.isLoading = true;
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.orders = orders || [];
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  viewOrderDetails(order: any) {
    this.router.navigate(['/payment-success'], {
      state: {
        orderId: order.id,
        total: order.total_amount,
        date: order.created_at,
        items: order.order_items.map((item: any) => ({
          ...item.products,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        }))
      }
    });
  }
}
