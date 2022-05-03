import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ShareModule } from '../../_shared/share.module';

import { MainPageRoutingModule } from './main-routing.module';
import { DashboardPage } from './dashboard/dashboard.page';
import { SalesLedgerPage } from './sales-ledger/sales-ledger.page';
import { ChartSettingsComponent } from 'src/app/components/chart-settings/chart-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    MainPageRoutingModule
  ],
  declarations: [
    DashboardPage,
    SalesLedgerPage,
    ChartSettingsComponent
  ]
})
export class MainPageModule {}
