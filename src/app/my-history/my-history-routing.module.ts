import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyHistoryPage } from './my-history.page';

const routes: Routes = [
  {
    path: '',
    component: MyHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyHistoryPageRoutingModule {}
