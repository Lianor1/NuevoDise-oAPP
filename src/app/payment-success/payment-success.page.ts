  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { createClient, SupabaseClient } from '@supabase/supabase-js';
  import { environment } from 'src/environments/environment';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';

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
      name: 'DINA',
      ruc: '12345678901',
      address: 'Andahuaylas',
      phone: '987654321'
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
      const doc = new jsPDF();
    
      // Título
      doc.setFontSize(18);
      doc.text('Comprobante de Pago', 10, 10);
    
      // Datos básicos de la compra
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date(this.orderDetails.date).toLocaleString()}`, 10, 20);
      doc.text(`Orden #: ${this.orderDetails.orderId}`, 10, 30);
      doc.text(`Método de Pago: ${this.orderDetails.paymentMethod}`, 10, 40);
    
      // Detalles de los productos
      const items = this.orderDetails.items.map((item: any) => [
        item.name,
        item.quantity,
        `S/ ${item.price.toFixed(2)}`,
        `S/ ${(item.quantity * item.price).toFixed(2)}`
      ]);
    
      // Añadir la tabla de productos
      autoTable(doc, {
        head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
        body: items,
        startY: 50,
        didDrawPage: (data) => {
          // Usar el `data.cursor` para obtener la posición final de la tabla
          const yPosition = data.cursor; // Esta es la posición final de la tabla después de dibujarla
          
          // Verificar que yPosition no sea nulo y sumarle 10
          if (yPosition !== null) {
            doc.text(
              `Total: S/ ${this.orderDetails.total.toFixed(2)}`,
              10,
              yPosition.y + 10 // Acceder a la propiedad 'y' de 'yPosition' y sumarle 10
            );
          } else {
            // Si `yPosition` es null, usar un valor por defecto
            doc.text(
              `Total: S/ ${this.orderDetails.total.toFixed(2)}`,
              10,
              100 // Un valor por defecto en caso de que yPosition sea null
            );
          }
        }
      });
    
      // Guardar el PDF con un nombre único
      doc.save(`Comprobante_${this.orderDetails.orderId}.pdf`);
    }
    
    

    goToHome() {
      this.router.navigate(['/home']);
    }
  } 