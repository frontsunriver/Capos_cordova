import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductPage } from '../products/product/product.page';
import { CollectionsPage } from './collections/collections.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { OrdersPage } from './orders/orders.page';
import { PagesPage } from './pages/pages.page';
import { SettingsPage } from './settings/settings.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardPage
  },
  {
    path: 'product',
    component: ProductPage
  },
  {
    path: 'collections',
    component: CollectionsPage
  },
  {
    path: 'orders',
    component: OrdersPage
  },
  {
    path: 'pages',
    component: PagesPage
  },
  {
    path: 'settings',
    component: SettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EcommercePageRoutingModule {}
