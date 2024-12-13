import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ToastController, ModalController } from '@ionic/angular';
import { SizeSelectorComponent } from '../components/size-selector/size-selector.component';
import { AuthService } from '../services/auth.service';

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
  categories = ['Hombres', 'Mujeres'];
  selectedCategory: string = 'all';
  selectedProduct: any = null;
  cartItemCount$ = this.cartService.cartItemCount$;
  
  constructor(
    private router: Router,
    private cartService: CartService,
    private toastController: ToastController,
    private modalController: ModalController,
    public authService: AuthService
  ) {
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
        loop: true,
          
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
        .select('id, name, price, image_url, description, category, stock, size')
        .order('created_at', { ascending: false });

      if (this.selectedCategory !== 'all') {
        query = query.eq('category', this.selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      console.log('Producto con descripción:', data);
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
    console.log('Producto seleccionado:', product);
    this.selectedProduct = product;
    document.body.style.overflow = 'hidden';
  }

  closeProductDetail() {
    this.selectedProduct = null;
    document.body.style.overflow = 'auto';
  }
// para el carrito
  goToCart() {
    this.router.navigate(['/carrito']);
  }

  async addToCart(product: any) {
    const modal = await this.modalController.create({
      component: SizeSelectorComponent,
      componentProps: {
        product: product
      },
      cssClass: 'size-selector-modal',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });

    await modal.present();

    // Esperar la respuesta del modal
    const { data } = await modal.onDidDismiss();
    
    if (data) {
      // Agregar al carrito con la talla seleccionada
      this.cartService.addToCart(product, data.size);
      
      const toast = await this.toastController.create({
        message: 'Producto agregado al carrito',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      toast.present();
    }
  }
}
