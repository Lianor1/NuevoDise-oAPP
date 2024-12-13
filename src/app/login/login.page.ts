import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private supabase: SupabaseClient;
  authForm!: FormGroup;
  isLogin = true;
  returnToPayment: boolean = false;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initForm();
    this.route.params.subscribe(params => {
      this.returnToPayment = params['returnToPayment'] === 'true';
    });
  }

  ngOnInit() {
    // Puedes agregar aquí cualquier inicialización adicional
  }

  private initForm() {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['']
    });
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    if (!this.isLogin) {
      this.authForm.get('fullName')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('fullName')?.clearValidators();
    }
    this.authForm.get('fullName')?.updateValueAndValidity();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.authForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Por favor espere...'
      });
      await loading.present();

      try {
        const { email, password, fullName } = this.authForm.value;

        if (this.isLogin) {
          // Login
          const { data: { user }, error } = await this.supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
          });

          if (error) throw error;

          if (user) {
            const { data: profile, error: profileError } = await this.supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            if (profileError) throw profileError;

            if (this.returnToPayment) {
              this.router.navigate(['/payment']);
            } else {
              this.router.navigate(['/home']);
            }
          }
        } else {
          // Registro
          const { data: { user }, error } = await this.supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                full_name: fullName.trim()
              }
            }
          });

          if (error) throw error;

          this.presentToast('Registro exitoso. Por favor verifica tu email.');
        }

      } catch (error: any) {
        console.error('Error:', error);
        this.presentToast(error.message || 'Ha ocurrido un error');
      } finally {
        loading.dismiss();
      }
    }
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
