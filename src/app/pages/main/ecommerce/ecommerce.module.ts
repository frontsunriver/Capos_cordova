import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { EcommercePageRoutingModule } from './ecommerce-routing.module';
import { ShareModule } from 'src/app/_shared/share.module';
import { CollectionsPage } from './collections/collections.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { OrdersPage } from './orders/orders.page';
import { PagesPage } from './pages/pages.page';
import { SettingsPage } from './settings/settings.page';
import { LongPressModule } from 'ionic-long-press';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LongPressModule,
    ShareModule,    
    EcommercePageRoutingModule
  ],
  declarations: [
    CollectionsPage,
    DashboardPage,
    OrdersPage,
    PagesPage,
    SettingsPage
  ]
})
export class EcommercePageModule {}
