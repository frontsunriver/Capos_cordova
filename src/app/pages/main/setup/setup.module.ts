import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/_shared/share.module';
import { LongPressModule } from 'ionic-long-press';

import { SetupPageRoutingModule } from './setup-routing.module';

import { GeneralPage } from './general/general.page';
import { PreferencesPage } from './preferences/preferences.page';
import { StorePolicyPage } from './store-policy/store-policy.page';
import { SalesTaxesPage } from './sales-taxes/sales-taxes.page';
import { CustomerPointGiftPage } from './customer-point-gift/customer-point-gift.page';
import { PaymentTypesPage } from './payment-types/payment-types.page';
import { OutletsPage } from './outlets/outlets.page';
import { EditOutletPage } from './outlets/edit-outlet/edit-outlet.page';
import { StationPage } from './station/station.page';
import { StoreManagementPage } from './store-management/store-management.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    SetupPageRoutingModule,
    LongPressModule,
    NgxDatatableModule
  ],
  declarations: [
    GeneralPage,
    PreferencesPage,
    StorePolicyPage,
    SalesTaxesPage,
    CustomerPointGiftPage,
    PaymentTypesPage,
    OutletsPage,
    EditOutletPage,
    StationPage,
    StoreManagementPage
  ]
})
export class SetupPageModule {}
