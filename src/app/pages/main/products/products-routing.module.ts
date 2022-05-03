import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttributePage } from './attribute/attribute.page';
import { BrandPage } from './brand/brand.page';
import { BundlesPage } from './bundles/bundles.page';
import { PriceBooksPage } from './price-books/price-books.page';
import { ProductTagPage } from './product-tag/product-tag.page';
import { ProductTypePage } from './product-type/product-type.page';
import { ProductPage } from './product/product.page';
import { SupplierPage } from './supplier/supplier.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'product',
    pathMatch: 'full',
  },
  {
    path: 'product',
    component: ProductPage
  },  
  {
    path: 'brand',
    component: BrandPage,    
  },
  {
    path: 'price-books',
    component: PriceBooksPage    
  },
  {
    path: 'product-tag',
    component: ProductTagPage
  },
  {
    path: 'product-type',
    component: ProductTypePage    
  },
  {
    path: 'attribute',
    component: AttributePage    
  },  
  {
    path: 'supplier',
    component: SupplierPage    
  },  
  {
    path: 'mix-and-match',
    component: BundlesPage    
  },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsPageRoutingModule {}
