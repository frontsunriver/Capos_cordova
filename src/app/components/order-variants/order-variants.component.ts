import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IOrderProduct, Order } from 'src/app/_classes/order.class';
import { Product } from 'src/app/_classes/product.class';
import { ToastService } from 'src/app/_services/toast.service';
import { EditVariantQtyComponent } from '../edit-variant-qty/edit-variant-qty.component';
import * as UtilFunc from 'src/app/_helpers/util.helper';

interface IData {
  checked: boolean,
  product: IOrderProduct
}

@Component({
  selector: 'app-order-variants',
  templateUrl: './order-variants.component.html',
  styleUrls: ['./order-variants.component.scss'],
})
export class OrderVariantsComponent implements OnInit {

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
        this.table_data.push({
          checked: false,
          product: Order.getNewOrderProduct(this.product, p._id)
        })
      }  
    }
  }

  getProductInventory(product:IOrderProduct) {
    if(!product.product.data.tracking_inv) {
      return '-';
    } else {
      return Order.getProductInventory(product);
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


  getProductTotal(product:IOrderProduct):string {
    let qty = product.qty;
    let total = parseFloat((qty * product.supply_price).toFixed(2));
    
    return UtilFunc.getPriceWithCurrency(total);
  }

  public get isValid() {
    for(let c of this.table_data) {
      if(c.checked){
        return true;
      }
    }
    return false;
  }

  async editQty(product:IOrderProduct) {
    const popover = await this.popoverController.create({
      component: EditVariantQtyComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {product: product}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.product) {
          product.qty = data.product.qty;
          product.supply_price = data.product.supply_price;
        }
      }
    });

    await popover.present(); 
  }

  doAction(){
    let products:IOrderProduct[] = [];
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
