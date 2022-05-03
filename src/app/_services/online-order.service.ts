import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { inherit } from 'hammerjs';
import { ChooseVariantsComponent } from '../components/choose-variants/choose-variants.component';
import { OnlineOrderVariantsComponent } from '../components/online-order-variants/online-order-variants.component';
import { OrderVariantsComponent } from '../components/order-variants/order-variants.component';
import { CartProduct } from '../_classes/cart_product.class';
import { Onlineorder } from '../_classes/onlineorder.class';
import { Product } from '../_classes/product.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class OnlineOrderService {

  changed: boolean = false;
  editable: boolean = false;
  order: Onlineorder;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.init();
  }

  init(_id?:string, callback?:Function) {
    this.order = new Onlineorder(this.authService, this.utilService);
    if(_id) {
      this.order.loadById(_id, () => {
        if(callback) callback();
      })
    }
  }

  async addProduct(product: Product) {
    if (!product) {
      return;
    }        
    if(product.data.variant_inv && product.data.variant_products.length>0) {
      const popover = await this.popoverController.create({
        component: OnlineOrderVariantsComponent,
        // event: ev,
        cssClass: 'popover_custom',      
        translucent: true,
        componentProps: {product: product}
      });
  
      popover.onDidDismiss().then(result => {      
        if(typeof result.data != 'undefined') {        
          let data = result.data;          
          if(data.process && data.products) {            
            for(let p of data.products){
              this.order.addProduct(p);
            }            
          } 
        }          
      });
      await popover.present();      
    } else {
      this.order.addProduct(new CartProduct(product), 1);      
    }        
  }

  removeProduct(index: number) {
    this.order.removeProduct(index);        
  }
}
