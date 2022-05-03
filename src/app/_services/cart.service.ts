import { Injectable } from '@angular/core';
import { Cart } from '../_classes/cart.class';
import { Openclose } from '../_classes/openclose.class';
import { Payment } from '../_classes/payment.class';
import { AuthService } from './auth.service';
import { LoadingService } from './loading.service';
import { UtilService } from './util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { PopoverController } from '@ionic/angular';
import { ChooseCustomerComponent } from '../components/choose-customer/choose-customer.component';
import { Customer } from '../_classes/customer.class';
import { Store } from '../_classes/store.class';
import { Product } from '../_classes/product.class';
import { AlertService } from './alert.service';
import { CartProduct } from '../_classes/cart_product.class';
import { PriceWeightComponent } from '../components/price-weight/price-weight.component';
import { ProductVariantsComponent } from '../components/product-variants/product-variants.component';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  user: any;
  cart: Cart;
  openClose: Openclose;
  lastClose: Openclose;
  store: Store;
  new_sale: any = null;
  action: string = '';

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private popoverController: PopoverController
  ) {   
    this.openClose = new Openclose(this.authService, this.utilService);
    this.cart = new Cart(this.authService, this.utilService);

    this.authService.currentUser.subscribe(user => {
      if(user) {
        this.user = user;
        this.init();                
      }
    })
  }

  init(callback?:Function) {
    this.store = new Store(this.authService, this.utilService);
    this.store.load();
    this.cart.store_info.load();
    this.getLastClose();
    this.openClose.init();
    this.openClose.loadCurrent(() => {
      this.loadCart(null, null, callback);
    }, () => {
      if(callback) callback(false);
    })
  }

  public get isOpenRegister():boolean {
    return this.openClose._id != '';
  }

  getLastClose() {
    this.lastClose = null;
    const query = {
      private_web_address: this.user.private_web_address, 
      outlet: this.user.outlet ? this.user.outlet._id : null,
      register: this.user.outlet.register[0],
      status: 2
    };
    if(!this.user.outlet) delete query.outlet;    
    this.utilService.get('sell/openclose', query).subscribe(async result => {
      if(result && result.body.length>0) {
        let c = result.body[0];
        this.lastClose = new Openclose(this.authService, this.utilService);
        this.lastClose.loadDetails(c);
      }
    });
  }

  openRegister(data:any, callback?:Function) {
    this.openClose.open_value = data.open_value;
    this.openClose.open_note = data.open_note;  
    this.openClose.save(() => {      
      this.init(callback);
    }, error => {
      callback(false);
    })
  }

  closeRegister(callback?:Function) {
    this.openClose.status = 2;
    this.openClose.save(() => {
      this.init();
      if(callback) callback();
    })    
  }

  loadCart(_id?:string, action?:string, callback?:Function) {
    this.action = action;
    if(!_id) {
      this.cart.init();
      this.cart.loadCurrent(() => {
        this.initCart();
        if(callback) callback(true);
      }, () => {
        this.initCart();
        if(callback) callback(true);
      })
    } else {
      this.cart.loadFromSale(_id, sale_data => {
        this.new_sale = sale_data;         
        if(callback) callback(true);  
      }, () => {
        if(callback) callback(false);
      })
    }
  }

  loadCartFromSale() {
    if(this.action) this.new_sale.cart_mode = this.action;
    if(this.action == 'return') {
      if(this.new_sale.customer){
        this.new_sale.origin_customer = this.new_sale.customer._id;
      }
      this.new_sale.origin_status = this.new_sale.sale_status;
      this.new_sale.origin_sale_number = this.new_sale.sale_number;
      this.new_sale._id = '';
      this.new_sale.sale_number = UtilFunc.genRandomOrderString(8);
    }    
    this.cart.loadByCart(this.new_sale); 
    if(this.new_sale.cart_mode == 'return') {   
      if(this.action == 'return') {   
        this.cart.setRefund();            
      }    
    }
    this.new_sale = null;
    this.action = null;
  }

  initCart() {        
    this.processCustomerCredit();
    if(this.cart.sale_status == 'on_account') {
      this.processCustomerBalance('', this.cart.total_paid);
    }        
  }

  newCart() {
    this.cart.delete(() => {
      this.cart.init();
    })
  }

  processCustomerCredit() {
    if(this.cart.customer) {
      let credit = 0;
      for(let payment of this.cart.payments) {
        if(payment.type == 'store_credit') {
          credit += payment.amount;
        }
      }      
      if(this.cart.isRefund) {
        this.cart.customer.temp.credit = Math.abs(credit);
        this.cart.customer.temp.total_issued = Math.abs(credit);
      } else {
        this.cart.customer.temp.credit = -credit;
        this.cart.customer.temp.total_redeemed = Math.abs(credit);
      }
    }
  }

  processCustomerBalance(pay_mode:string, pay_amount:number) {
    if (this.cart.customer) {
      let customer = this.cart.customer;
      if (pay_mode === 'on_account') {
        customer.temp.debit = pay_amount;
        customer.temp.total_spent = pay_amount;
      } else if(pay_mode == 'store_credit') {                
        if(this.cart.isRefund || this.cart.isVoid) {
          customer.temp.credit = Math.abs(pay_amount);
          customer.temp.total_issued = Math.abs(pay_amount);          
        } else {
          customer.temp.credit = -pay_amount;
          customer.temp.total_redeemed = Math.abs(pay_amount);
        }
      } else if(this.cart.sale_status == 'on_account') {
        if(this.cart.isRefund || this.cart.isVoid) {
          customer.temp.debit = Math.abs(pay_amount);
          customer.temp.total_spent = Math.abs(pay_amount);
        } else {
          customer.temp.debit = -pay_amount;
          customer.temp.total_spent = -pay_amount;
        }
      } else {
        if(this.store.customer_point_gift_settings.point_used) {
          let group = customer.data.groupId;
          if(typeof group.point_rates != 'undefined') {
            let index = group.point_rates.findIndex(item => item.payment == pay_mode);
            if(index>-1) {
              let rate = group.point_rates[index].rate;
              let point = parseFloat((pay_amount * rate / 100).toFixed(2));
              customer.temp.point = point;
              customer.temp.point_issued = point;
            }
          }
        }
      }
    }
  }

  async addToCart(product:Product) {            
    if(!this.checkCustomerInfoReq(product)) return;
    if(!this.checkRequiredAge(product)) return;
    if(product.data.variant_inv) {
      let cart_products:CartProduct[] = [];
      for(let vp of product.data.variant_products) {        
        let cart_product = new CartProduct(product, vp._id);        
        if(!cart_product.price && product.data.price_prompt || !cart_product.weight && product.data.scale_product 
          || !cart_product.serial && product.data.serial_required) {
          const properties = this.getPropertiesFromCarts(product._id, vp._id);
          cart_product.prompt_price = properties.prompt_price;
          cart_product.weight = properties.weight;    
          cart_product.serial = properties.serial;    
        }
        cart_product.qty = this.cart.getCurrentQty(cart_product);        
        cart_products.push(cart_product);        
      }    
      const popover = await this.popoverController.create({
        component: ProductVariantsComponent,
        // event: ev,
        cssClass: 'popover_custom',      
        translucent: true,
        componentProps: {data:{cart_products: cart_products}}
      });
  
      popover.onDidDismiss().then(result => {      
        if(typeof result.data != 'undefined') {        
          let data1 = result.data;
          if(data1.process) {
            for(let sp of data1.sel_products) {   
              let cart_product = new CartProduct(product, sp.variant_id);
              cart_product.prompt_price = sp.prompt_price;
              cart_product.weight = sp.weight;
              cart_product.serial = sp.serial;
              this.cart.addProduct(cart_product, sp.qty);
            }
            this.cart.save();          
          } 
        }          
      });
      await popover.present();

    } else {
      let cart_product = new CartProduct(product);
      const properties = this.getPropertiesFromCarts(product._id);
      cart_product.prompt_price = properties.prompt_price;
      cart_product.weight = properties.weight;
      cart_product.serial = properties.serial;

      let data = {price: '', weight:'', blank_cup_weight: 0, serial: ''}, f = false;      
      if(!cart_product.price && product.data.price_prompt) {
        f = true;
      } else {
        delete data.price;
      }
      if(!cart_product.weight && product.data.scale_product) {
        data.blank_cup_weight = product.data.blank_cup_weight;
        f = true;
      } else {
        delete data.blank_cup_weight;
        delete data.weight;
      }
      if(!cart_product.serial && product.data.serial_required) {
        f = true;
      } else {
        delete data.serial;
      }
      if(f){
        await this.openPW(cart_product, data);
      } else {
        this.cart.addProduct(cart_product);      
        this.cart.save();        
      }
    }
  }

  async openPW(cart_product:CartProduct, data:any) {
    const popover = await this.popoverController.create({
      component: PriceWeightComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {data:data}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data1 = result.data;
        if(data1.process) {
          if(data1.prompt_price) cart_product.prompt_price = data1.prompt_price;
          if(data1.weight) cart_product.weight = data1.weight;
          if(data1.serial) cart_product.serial = data1.serial;
          this.cart.addProduct(cart_product);      
          this.cart.save();                  
        } 
      }          
    });
    await popover.present();         
  }
  
  getPropertiesFromCarts(product_id:string, variant_id:string='') {
    let data = {
      prompt_price: 0,
      weight: 0,
      serial: ''
    };
    let index = this.cart.products.findIndex(item => item.product_id == product_id && item.variant_id == variant_id);
    if(index>-1) {
      data.prompt_price = this.cart.products[index].prompt_price;
      data.weight = this.cart.products[index].weight;
      data.serial = this.cart.products[index].serial;
    }
    return data;
  }

  checkCustomerInfoReq(product: Product): boolean {
    if(!product.data.customer_info_req || this.cart.customer) {
      return true;
    } else {
      this.alertService.presentAlert('Confirm Customer Info',
        'Need customer info in order to buy this product.<br>Please choose a customer.');      
      return false;
    }
  }

  checkRequiredAge(product: Product):boolean {
    if(!product.data.age_check_required) {
      return true;
    } else {
      let customer = this.cart.customer;
      if(!customer) {
        this.alertService.presentAlert('Confirm Customer Age', 
          'Need to check customer if he(she) meets the required age to buy this product.<br>Please choose a customer.');        
        return false;
      } else {
        let required_age = product.data.required_age;
        let customer_age = UtilFunc.getAge(customer.data.birthday);
        if(customer_age<required_age) {
          this.alertService.presentAlert('Confirm Customer Age', 
            'Only customer over the age of ' + required_age + ' can buy this product.');          
          return false;
        } else {
          return true;
        }
      }
    }
  }

  removeProductFromCart(product: CartProduct) {
    let index = this.cart.products.findIndex(item => item == product);    
    let sel_bundle = this.cart.getSelectedBundleProduct();
    if(sel_bundle.qty == product.qty) {
      this.cart.removeProduct(index);
    } else {
      product.qty -= sel_bundle.qty;
    }
    this.cart.save();
  }

  completeSale(callback:Function): void {
    const payment_status = this.cart.payment_status;
    const sale_status = this.cart.sale_status;
    const aa = ['layby', 'on_account'];
    if(!this.cart.isVoid) {
      if(aa.includes(payment_status) && sale_status == 'new'){
        this.cart.sale_status = payment_status;
      } else if(aa.includes(sale_status)) {
        this.cart.sale_status = sale_status + '_completed';
      } else {
        this.cart.sale_status = 'completed';
      }
    } else {
      if(this.cart.isVoidedSale) this.cart.voided = true;
    }
    if(this.cart.cart_mode == 'return') {
      this.cart.sale_status = 'return_completed';
    }
        
    if(this.cart.customer) this.cart.customer.save();
    // if (this.cart.customer && this.send_email) {
    //   this.emailToCustomer(this.cart.customer.data.email);
    // } else {
      this.cart.save(() => {
        callback();
      });
    // }
  }  

  emailToCustomer(email, callback:Function): void{
    const data = {};
    Object.assign(data, {email, cart_id: this.cart._id});
    this.utilService.post('sell/email', data).subscribe(result => {
      this.cart.save(() => {
        callback();
      });
    });
  }

  reloadOriginProducts(callback:Function) {
    let _ids = [];
    for(let cp of this.cart.products) {
      _ids.push(cp.product_id);
    }
    const data = {range: 'cart_products', _ids: _ids.join(',')};
    this.utilService.get('product/product', data).subscribe(result => {        
      if (result && result.body) {
        const products = result.body;
        products.forEach(product => {
          let index = this.cart.products.findIndex(item => item.product_id == product._id);
          if(index>-1) {
            let cp = this.cart.products[index];
            if(cp.product.data.variant_inv) {
              cp.product.data.variant_products = product.variant_products;
            } else {
              cp.product.data.inventory = product.inventory;
            }
          }
        });        
      }
      callback();
    });
  }

  checkProductsInventory(callback) {
    this.reloadOriginProducts(() => {
      for(let product of this.cart.products) {
        if(product.tracking_inv) {
          if (product.qty > product.inventory) {
            product.qty = product.inventory;
          }
          if(product.qty == 0) {
            let index = this.cart.products.findIndex(item => item.product_id == product.product_id && item.variant_id == product.variant_id);
            this.cart.products.splice(index, 1);
          }          
        }
      }
      callback();
    })
  }
}
