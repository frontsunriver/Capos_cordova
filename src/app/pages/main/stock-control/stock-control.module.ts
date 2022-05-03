import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockControlPageRoutingModule } from './stock-control-routing.module';
import { ShareModule } from 'src/app/_shared/share.module';
import { ManageOrdersPage } from './manage-orders/manage-orders.page';
import { ReceiveStockPage } from './receive-stock/receive-stock.page';
import { ReturnStockPage } from './return-stock/return-stock.page';
import { AutoCompleteModule } from 'ionic4-auto-complete';
import { SearchProductService } from 'src/app/_services/search-product.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    StockControlPageRoutingModule,
    AutoCompleteModule
  ],
  declarations: [
    ManageOrdersPage,
    ReceiveStockPage,
    ReturnStockPage
  ],
  providers: [SearchProductService]
})
export class StockControlPageModule {}
