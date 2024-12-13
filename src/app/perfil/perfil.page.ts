import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  orderStats = {
    totalOrders: 0,
    totalAmount: 0,
    points: 0,
    level: 'Bronce'
  };

  constructor() {}

  ngOnInit() {
    this.loadOrderStats();
  }

  loadOrderStats() {
  }
}
