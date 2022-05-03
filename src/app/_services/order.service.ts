import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OrderVariantsComponent } from '../components/order-variants/order-variants.component';
import { Order } from '../_classes/order.class';
import { Product } from '../_classes/product.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  order: Order;
  changed: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.init();
  }

  init(data?: any) {
    this.order = new Order(this.authService, this.utilService);    
    if(data) {
      this.order.data = data;
    }
  }

  async addProduct(product:Product) {            
    if(product.data.variant_inv) {      
      const popover = await this.popoverController.create({
        component: OrderVariantsComponent,
        // event: ev,
        cssClass: 'popover_custom',      
        translucent: true,
        componentProps: {product: product, type: 'purchase'}
      });
  
      popover.onDidDismiss().then(result => {      
        if(typeof result.data != 'undefined') {        
          let data1 = result.data;
          if(data1.process) {
            console.log(data1.products);
            for(let p of data1.products) {   
              this.order.addProduct(p);
            }
          } 
        }          
      });
      await popover.present();

    } else {      
      this.order.addProduct(Order.getNewOrderProduct(product));
    }
  }

  save(data:any, callback?:Function, err?:Function) {
    Object.keys(data).forEach(key => {
      this.order.data[key] = data[key];
    });    
    this.order.save(() => {
      this.changed = true;
      if(callback) callback();
    }, error => {
      if(err) err();
    })
  }
}
