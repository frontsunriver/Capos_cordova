import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_helpers/auth.guard';
import { Auth2Guard } from './_helpers/auth2.guard';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddToCartComponent } from './components/add-to-cart/add-to-cart.component';
import { RetrieveSaleComponent } from './components/retrieve-sale/retrieve-sale.component';
import { RegisterDetailComponent } from './components/register-detail/register-detail.component';
import { EditBundleComponent } from './components/edit-bundle/edit-bundle.component';
import { AddToBundleComponent } from './components/add-to-bundle/add-to-bundle.component';
import { EditProductComponent } from './components/edit-product/edit-product.component';
import { EditCustomerComponent } from './components/edit-customer/edit-customer.component';
import { EditRoleComponent } from './components/edit-role/edit-role.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { EditOrderStockComponent } from './components/edit-order-stock/edit-order-stock.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { AddToOrderComponent } from './components/add-to-order/add-to-order.component';
import { EditCollectionComponent } from './components/edit-collection/edit-collection.component';
import { AddToCollectionComponent } from './components/add-to-collection/add-to-collection.component';
import { OnlineOrderDetailComponent } from './components/online-order-detail/online-order-detail.component';
import { EditOnlineOrderComponent } from './components/edit-online-order/edit-online-order.component';
import { AddToOnlineOrderComponent } from './components/add-to-online-order/add-to-online-order.component';
import { LoadingPage } from './pages/loading/loading.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'static',
    pathMatch: 'full'
  },
  {
    path: 'loading',
    component: LoadingPage
  },
  {
    path: 'static',
    loadChildren: () => import('./pages/static/static.module').then( m => m.StaticPageModule),
    canActivate: [Auth2Guard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthModule),
    canActivate: [Auth2Guard]
  },  
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then( m => m.MainPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sel-product',
    component: ProductListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-to-cart',
    component: AddToCartComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-to-bundle',
    component: AddToBundleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-to-order',
    component: AddToOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-to-online-order',
    component: AddToOnlineOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-to-collection',
    component: AddToCollectionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'retrieve-sale',
    component: RetrieveSaleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register-detail',
    component: RegisterDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-bundle',
    component: EditBundleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-product',
    component: EditProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-customer',
    component: EditCustomerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-role',
    component: EditRoleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-employee',
    component: EditEmployeeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-order-stock',
    component: EditOrderStockComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'order-detail',
    component: OrderDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-collection',
    component: EditCollectionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'online-order-detail',
    component: OnlineOrderDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-online-order',
    component: EditOnlineOrderComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
