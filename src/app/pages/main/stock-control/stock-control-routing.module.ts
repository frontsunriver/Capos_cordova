import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageOrdersPage } from './manage-orders/manage-orders.page';
import { ReceiveStockPage } from './receive-stock/receive-stock.page';
import { ReturnStockPage } from './return-stock/return-stock.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'manage-orders',
    pathMatch: 'full',
  },
  {
    path: 'manage-orders',
    component: ManageOrdersPage
  },
  {
    path: 'receive-stock',
    component: ReceiveStockPage
  },
  {
    path: 'return-stock',
    component: ReturnStockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockControlPageRoutingModule {}
