import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CashManagementPage } from './cash-management/cash-management.page';
import { FulfillmentsPage } from './fulfillments/fulfillments.page';
import { OpenRegisterPage } from './open-register/open-register.page';
import { QuotedSalesPage } from './quoted-sales/quoted-sales.page';
import { SalesHistoryPage } from './sales-history/sales-history.page';

import { SellPage } from './sell/sell.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sell',
    pathMatch: 'full'    
  },
  {
    path: 'selling',
    component: SellPage
  },
  {
    path: 'cash-management',
    component: CashManagementPage
  },  
  {
    path: 'fulfillments',
    component: FulfillmentsPage
  },
  {
    path: 'open-register',
    component: OpenRegisterPage
  },
  {
    path: 'quoted-sales',
    component: QuotedSalesPage
  },
  {
    path: 'sales-history',
    component: SalesHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellPageRoutingModule {}
