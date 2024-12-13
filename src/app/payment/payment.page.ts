import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage {
  selectedMethod: string = '';

  constructor(
    private router: Router,
    private navController: NavController,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        history.pushState(null, '', '');
      }
    });
  }

  selectPaymentMethod(method: string) {
    this.selectedMethod = method;
  }

  proceedToConfirmation() {
    if (this.selectedMethod) {
      this.router.navigate(['/confirmation'], {
        state: { paymentMethod: this.selectedMethod }
      });
    }
  }

  backToCart() {
    this.router.navigate(['/home']);
  }

  async goBack() {
    await this.navController.navigateBack('/home');
    await this.authService.refreshSession();
  }
}
