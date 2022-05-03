import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { CartProduct } from 'src/app/_classes/cart_product.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { PriceWeightComponent } from '../price-weight/price-weight.component';

@Component({
  selector: 'app-product-variants',
  templateUrl: './product-variants.component.html',
  styleUrls: ['./product-variants.component.scss'],
})
export class ProductVariantsComponent implements OnInit {
  
  util = UtilFunc;
  form: FormGroup;
  data:any;
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) {
  }

  ngOnInit() {
    let form_control = {}; let index = 0;
    for(let cp of this.data.cart_products) {            
      if(!cp.tracking_inv) {
        form_control['qty' + index] = [0];
      } else {
        form_control['qty' + index] = [0, [Validators.max(cp.inventory_virtual)]];
      }
      form_control['checked' + index] = [false];
      index++;
    }    
    this.form = this.fb.group(form_control);
  }

  async selProduct(index:number) {    
    let checked = this.form.get('checked' + index).value;
    let cart_product:CartProduct = this.data.cart_products[index];
    if(checked) {
      let data = {price: '', weight:'', blank_cup_weight: 0}, f = false;      
      if(!cart_product.price && cart_product.product.data.price_prompt && !cart_product.product.data.has_no_price) {
        f = true;
      } else {
        delete data.price;
      }
      if(!cart_product.weight && cart_product.product.data.scale_product) {
        data.blank_cup_weight = cart_product.product.data.blank_cup_weight;
        f = true;
      } else {
        delete data.blank_cup_weight;
        delete data.weight;
      }

      if(f) {
        const popover = await this.popoverController.create({
          component: PriceWeightComponent,
          // event: ev,
          cssClass: 'popover_custom fixed-width',      
          translucent: true,
          componentProps: {data:data}
        });
    
        popover.onDidDismiss().then(result => {      
          let a = false;
          if(typeof result.data != 'undefined') {        
            let data1 = result.data;
            if(data1.process) {
              if(data1.prompt_price) cart_product.prompt_price = data1.prompt_price;
              if(data1.weight) cart_product.weight = data1.weight;
              this.form.get('qty' + index).setValue(1);
              a = true;
            } 
          }
          if(!a) this.form.get('checked' + index).setValue(false);
        });
        await popover.present(); 
      } else {
        this.form.get('qty' + index).setValue(1);
      }
    } else {      
      this.form.get('qty' + index).setValue(0);
    }
  }

  public get isValid() {
    for(let i=0;i<this.data.cart_products.length;i++) {
      if(this.form.get('checked' + i).value && this.form.get('qty' + i).value>0) {
        return true;
      }
    }
    return false;
  }

  public inventory_str(product:any):string {
    if(!product.tracking_inv) {
      return '-';
    } else {
      if(product.inventory_virtual == 0) {
        return 'Out of Stock';
      } else {
        return product.inventory_virtual.toString();
      }
    }
  }

  public isInStock(product:any):boolean {
    if(!product.tracking_inv) {
      return true;
    } else {
      return product.inventory_virtual > 0;
    }
  }

  getError(index:number) {
    return 'This value must be less than ' + this.data.cart_products[index].inventory_virtual;
  }

  doAction(){
    this.isSubmitted = true;
    if(this.form.valid) {
      let sel_products = [];
      for(let i=0;i<this.data.cart_products.length;i++) {
        let qty = this.form.get('qty' + i).value;
        let checked = this.form.get('checked' + i).value;
        if(checked && qty>0) {
          sel_products.push({
            variant_id: this.data.cart_products[i].variant_id,
            prompt_price: this.data.cart_products[i].prompt_price,
            weight: this.data.cart_products[i].weight,
            qty: qty
          })
        }
      }
      this.popoverController.dismiss({process: true, sel_products: sel_products});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
