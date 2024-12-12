import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private supabase: SupabaseClient;
  products: any[] = [];
  categories = ['Hombres', 'Mujeres', 'Niños'];
  selectedCategory: string = 'all';
  
  slideOpts = {
    slidesPerView: 1,
    autoplay: true,
    loop: true
  };

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    try {
      let query = this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (this.selectedCategory !== 'all') {
        query = query.eq('category', this.selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      this.products = data || [];
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  filterByCategory(event: any) {
    if (event && event.detail) {
      this.selectedCategory = event.detail.value;
      this.loadProducts();
    }
  }
}
