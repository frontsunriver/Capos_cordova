import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportingPageRoutingModule } from './reporting-routing.module';
import { InventoryReportsPage } from './inventory-reports/inventory-reports.page';
import { PaymentReportsPage } from './payment-reports/payment-reports.page';
import { RegisterClosuresPage } from './register-closures/register-closures.page';
import { SalesReportsPage } from './sales-reports/sales-reports.page';
import { StoreCreditReportsPage } from './store-credit-reports/store-credit-reports.page';
import { ShareModule } from 'src/app/_shared/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    ReportingPageRoutingModule
  ],
  declarations: [
    InventoryReportsPage,
    PaymentReportsPage,
    RegisterClosuresPage,
    SalesReportsPage,
    StoreCreditReportsPage
  ]
})
export class ReportingPageModule {}
