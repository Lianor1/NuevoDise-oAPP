import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-menu contentId="main-content" *ngIf="authService.isAuthenticated()">
        <ion-header>
          <ion-toolbar>
            <ion-title>Menú</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <ion-list>
            <ion-item routerLink="/perfil" routerDirection="root" (click)="closeMenu()">
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-label>Mi Perfil</ion-label>
            </ion-item>

            <ion-item routerLink="/my-history" routerDirection="root" (click)="closeMenu()">
              <ion-icon name="bag-check-outline" slot="start"></ion-icon>
              <ion-label>Mi Historial</ion-label>
            </ion-item>

            <ion-item routerLink="/favorites" routerDirection="root" (click)="closeMenu()">
              <ion-icon name="heart-outline" slot="start"></ion-icon>
              <ion-label>Favoritos</ion-label>
            </ion-item>

            <ion-item (click)="logout()">
              <ion-icon name="log-out-outline" slot="start"></ion-icon>
              <ion-label>Cerrar Sesión</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent {
  constructor(public authService: AuthService, private menuCtrl: MenuController) {}

  logout() {
    this.authService.logout();
    // Redirigir a home o login después de cerrar sesión
  }

  async closeMenu() {
    await this.menuCtrl.close();
  }
}
