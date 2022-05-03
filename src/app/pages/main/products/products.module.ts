import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsPageRoutingModule } from './products-routing.module';

import { AttributePage } from './attribute/attribute.page';
import { BrandPage } from './brand/brand.page';
import { BundlesPage } from './bundles/bundles.page';
import { PriceBooksPage } from './price-books/price-books.page';
import { ProductTagPage } from './product-tag/product-tag.page';
import { ProductTypePage } from './product-type/product-type.page';
import { ProductPage } from './product/product.page';
import { SupplierPage } from './supplier/supplier.page';
import { ShareModule } from 'src/app/_shared/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    ProductsPageRoutingModule
  ],
  declarations: [
    AttributePage,
    BrandPage,
    BundlesPage,
    PriceBooksPage,
    ProductTagPage,
    ProductTypePage,
    ProductPage,
    SupplierPage
  ]
})
export class ProductsPageModule {}
