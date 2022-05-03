import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerPointGiftPage } from './customer-point-gift/customer-point-gift.page';
import { GeneralPage } from './general/general.page';
import { EditOutletPage } from './outlets/edit-outlet/edit-outlet.page';
import { OutletsPage } from './outlets/outlets.page';
import { PaymentTypesPage } from './payment-types/payment-types.page';
import { PreferencesPage } from './preferences/preferences.page';
import { SalesTaxesPage } from './sales-taxes/sales-taxes.page';
import { StorePolicyPage } from './store-policy/store-policy.page';
import { SubscriptionPage } from './subscription/subscription.page';
import { StationPage } from './station/station.page';
import { StoreManagementPage } from './store-management/store-management.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'general',
    pathMatch: 'full'
  },
  {
    path: 'general',
    component: GeneralPage
  },
  {
    path: 'preferences',
    component: PreferencesPage
  },
  {
    path: 'store-policy',
    component: StorePolicyPage
  },
  {
    path: 'sales-taxes',
    component: SalesTaxesPage
  },
  {
    path: 'customer-point-gift',
    component: CustomerPointGiftPage
  },
  {
    path: 'payment-types',
    component: PaymentTypesPage
  },
  {
    path: 'outlets',
    component: OutletsPage
  },
  {
    path: 'outlets/edit-outlet',
    component: EditOutletPage
  },
  {
    path: 'subscription',
    component: SubscriptionPage
  },
  {
    path: 'station',
    component: StationPage
  },
  {
    path: 'store-management',
    component: StoreManagementPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupPageRoutingModule {}
