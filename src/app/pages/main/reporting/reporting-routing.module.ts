import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryReportsPage } from './inventory-reports/inventory-reports.page';
import { PaymentReportsPage } from './payment-reports/payment-reports.page';
import { RegisterClosuresPage } from './register-closures/register-closures.page';
import { SalesReportsPage } from './sales-reports/sales-reports.page';
import { StoreCreditReportsPage } from './store-credit-reports/store-credit-reports.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sales'
  },
  {
    path: 'sales',
    component: SalesReportsPage,    
  },
  {
    path: 'inventory',
    component: InventoryReportsPage    
  },
  {
    path: 'payment',
    component: PaymentReportsPage,    
  },
  {
    path: 'closures',
    component: RegisterClosuresPage,    
  },  
  {
    path: 'store-credit',
    component: StoreCreditReportsPage,    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportingPageRoutingModule {}
