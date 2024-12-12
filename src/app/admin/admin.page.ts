import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  private supabase: SupabaseClient;
  selectedSection = 'products';
  products: any[] = [];
  orders: any[] = [];

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async ngOnInit() {
    await this.checkAdminAuth();
    await this.loadProducts();
    await this.loadOrders();

    const { data: { session } } = await this.supabase.auth.getSession();
    console.log('Session:', session); // Verifica que tienes sesión
    
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .single();
    console.log('Profile:', profile); // Verifica que el rol es 'admin'
  }

  async checkAdminAuth() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      console.log('Session:', session); // Para debug
      
      if (error || !session) {
        console.error('No hay sesión:', error);
        this.router.navigate(['/login']);
        return;
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Profile:', profile); // Para debug

      if (profileError || profile?.role !== 'admin') {
        console.error('Error de perfil o no es admin:', profileError);
        await this.presentToast('Acceso denegado: Se requieren permisos de administrador');
        this.router.navigate(['/home']);
        return;
      }
    } catch (error) {
      console.error('Error en checkAdminAuth:', error);
      this.router.navigate(['/login']);
    }
  }

  segmentChanged(ev: any) {
    this.selectedSection = ev.detail.value;
  }

  async loadProducts() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.products = data || [];
    } catch (error) {
      console.error('Error:', error);
      this.presentToast('Error al cargar productos');
    } finally {
      loading.dismiss();
    }
  }

  async loadOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
    } else {
      this.orders = data;
    }
  }

  async addProduct() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar Producto',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del producto'
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción'
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio'
        },
        {
          name: 'stock',
          type: 'number',
          placeholder: 'Stock'
        },
        {
          name: 'image_url',
          type: 'text',
          placeholder: 'URL de la imagen'
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Categoría'
        },
        {
          name: 'size',
          type: 'text',
          placeholder: 'Tallas (separadas por coma)'
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: async (data) => {
            const loading = await this.loadingCtrl.create();
            await loading.present();

            // Convertir el string de tallas en un array
            const sizeArray = data.size.split(',').map((size: string) => size.trim());

            const productData = {
              name: data.name,
              description: data.description,
              price: parseFloat(data.price),
              stock: parseInt(data.stock),
              image_url: data.image_url,
              category: data.category,
              size: sizeArray,
              color: data.color
            };

            const { error } = await this.supabase
              .from('products')
              .insert([productData]);

            loading.dismiss();

            if (error) {
              console.error('Error:', error);
              this.presentToast('Error al agregar producto');
            } else {
              this.presentToast('Producto agregado exitosamente');
              this.loadProducts();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editProduct(product: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Producto',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: product.name,
          placeholder: 'Nombre del producto'
        },
        {
          name: 'price',
          type: 'number',
          value: product.price,
          placeholder: 'Precio'
        },
        {
          name: 'stock',
          type: 'number',
          value: product.stock,
          placeholder: 'Stock'
        },
        {
          name: 'image_url',
          type: 'text',
          value: product.image_url,
          placeholder: 'URL de la imagen'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: async (data) => {
            const loading = await this.loadingCtrl.create();
            await loading.present();

            const { error } = await this.supabase
              .from('products')
              .update(data)
              .eq('id', product.id);

            loading.dismiss();

            if (error) {
              this.presentToast('Error al actualizar producto');
            } else {
              this.presentToast('Producto actualizado');
              this.loadProducts();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProduct(product: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar producto?',
      message: '¿Estás seguro de que quieres eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingCtrl.create();
            await loading.present();

            const { error } = await this.supabase
              .from('products')
              .delete()
              .eq('id', product.id);

            loading.dismiss();

            if (error) {
              this.presentToast('Error al eliminar producto');
            } else {
              this.presentToast('Producto eliminado');
              this.loadProducts();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
