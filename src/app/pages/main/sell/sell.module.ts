import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AutoCompleteModule } from 'ionic4-auto-complete';

import { SellPageRoutingModule } from './sell-routing.module';

import { SellPage } from './sell/sell.page';
import { ShareModule } from 'src/app/_shared/share.module';
import { CashManagementPage } from './cash-management/cash-management.page';
import { OpenRegisterPage } from './open-register/open-register.page';
import { QuotedSalesPage } from './quoted-sales/quoted-sales.page';
import { SalesHistoryPage } from './sales-history/sales-history.page';
import { FulfillmentsPage } from './fulfillments/fulfillments.page';
import { SearchProductService } from 'src/app/_services/search-product.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    SellPageRoutingModule,
    AutoCompleteModule
  ],
  declarations: [
    SellPage,
    CashManagementPage,
    OpenRegisterPage,
    QuotedSalesPage,
    SalesHistoryPage,
    FulfillmentsPage
  ],
  providers: [SearchProductService]
})
export class SellPageModule {}
