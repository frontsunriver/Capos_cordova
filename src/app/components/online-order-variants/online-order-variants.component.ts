import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CartProduct } from 'src/app/_classes/cart_product.class';
import { Product } from 'src/app/_classes/product.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { ToastService } from 'src/app/_services/toast.service';
import { EditOnlineOrderProductComponent } from '../edit-online-order-product/edit-online-order-product.component';

interface IData {
  checked: boolean,
  product: CartProduct
}

@Component({
  selector: 'app-online-order-variants',
  templateUrl: './online-order-variants.component.html',
  styleUrls: ['./online-order-variants.component.scss'],
})
export class OnlineOrderVariantsComponent implements OnInit {
  
  product: Product;
  type: string;
  all_check:boolean = false;
  table_data:IData[] = [];
  util = UtilFunc;

  constructor(
    private toastService: ToastService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    if(this.product) {
      for(let p of this.product.data.variant_products) {
        let cartProduct = new CartProduct(this.product, p._id);
        cartProduct.qty = 1;
        this.table_data.push({
          checked: false,
          product: cartProduct
        })
      }  
    }
  }

  onAllCheck() {
    for(let c of this.table_data) {
      c.checked = this.all_check;
    }
  }

  updateAllCheck() {
    if(this.table_data.filter(c => c.checked).length == 0) {
      this.all_check = false;
    } else if(this.table_data.every(c => c.checked)) {
        this.all_check = true;
    }
  }

  someCheck(): boolean {    
    let c = this.table_data.filter(c => c.checked);    
    if (c.length == 0) {
      return false;
    }
    return this.table_data.length != c.length;
  }

  public get isValid() {
    for(let c of this.table_data) {
      if(c.checked){
        return true;
      }
    }
    return false;
  }

  async editQty(product:CartProduct) {
    const popover = await this.popoverController.create({
      component: EditOnlineOrderProductComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {product: product}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process) {
          product.qty = data.qty;
          product.discount.mode = data.discount_mode;          
          product.discount.value = data.discount_value;          
        }
      }
    });

    await popover.present(); 
  }

  doAction(){
    let products:CartProduct[] = [];
    for(let data of this.table_data) {
      if(data.checked && data.product.qty > 0) {
        products.push(data.product);
      }
    }
    if(products.length == 0) {
      this.toastService.show('Please choose at lease a variant.');
      return;
    }
    this.popoverController.dismiss({process: true, products: products});
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
