import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyHistoryPageRoutingModule } from './my-history-routing.module';

import { MyHistoryPage } from './my-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyHistoryPageRoutingModule
  ],
  declarations: [MyHistoryPage]
})
export class MyHistoryPageModule {}
