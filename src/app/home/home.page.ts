import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';

// Registrar Swiper
register();

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
  selectedProduct: any = null;
  
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async ngOnInit() {
    await this.loadProducts();
    // Inicializar Swiper
    const swiperEl = document.querySelector('swiper-container');
    
    if (swiperEl) {
      const swiperParams = {
        slidesPerView: 1,
        effect: 'fade',
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        },
        pagination: {
          clickable: true
        },
        navigation: true,
        loop: true
      };

      Object.assign(swiperEl, swiperParams);
      // @ts-ignore
      swiperEl.initialize();
    }
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
      
      console.log('Datos de productos:', data);
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

  showProductDetail(product: any) {
    this.selectedProduct = product;
    document.body.style.overflow = 'hidden';
  }

  closeProductDetail() {
    this.selectedProduct = null;
    document.body.style.overflow = 'auto';
  }
}
