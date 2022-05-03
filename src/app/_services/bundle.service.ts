import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ChooseVariantsComponent } from '../components/choose-variants/choose-variants.component';
import { Bundle } from '../_classes/bundle.class';
import { Product } from '../_classes/product.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  bundle:Bundle;
  changed: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.init();
  }

  init(detail?:any) {
    this.bundle = new Bundle(this.authService, this.utilService);
    if(detail) {
      this.bundle.loadDetails(detail);
    } else {
      this.utilService.get('product/new_bundle_id').subscribe(result => {
        if(result && result.body) {
          this.bundle.bundle_id = result.body.bundle_id;
        }
      })
    }
  }

  async addProduct(product: Product) {
    if (!product) {
      return;
    }        
    if(product.data.variant_inv && product.data.variant_products.length>0) {
      const popover = await this.popoverController.create({
        component: ChooseVariantsComponent,
        // event: ev,
        cssClass: 'popover_custom',      
        translucent: true,
        componentProps: {product_name: product.data.name, variant_products: product.data.variant_products}
      });
  
      popover.onDidDismiss().then(result => {      
        if(typeof result.data != 'undefined') {        
          let data = result.data;
          if(data.process && data.variant_id) {
            this.bundle.addProduct(product, data.variant_id);
          } 
        }          
      });
      await popover.present();      
    } else {
      this.bundle.addProduct(product, '');      
    }        
  }

  removeProduct(index: number) {
    this.bundle.removeProduct(index);        
  }
}
