import { Component, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController, Platform, PopoverController } from '@ionic/angular';
import { AutoCompleteOptions, AutoCompleteComponent } from 'ionic4-auto-complete';
import { ChooseCustomerComponent } from 'src/app/components/choose-customer/choose-customer.component';
import { ConfirmPasswordComponent } from 'src/app/components/confirm-password/confirm-password.component';
import { DiscountComponent } from 'src/app/components/discount/discount.component';
import { PayAmountComponent } from 'src/app/components/pay-amount/pay-amount.component';
import { PayChangeComponent } from 'src/app/components/pay-change/pay-change.component';
import { QuantityComponent } from 'src/app/components/quantity/quantity.component';
import { SaleNoteComponent } from 'src/app/components/sale-note/sale-note.component';
import { UnfulfilledSaleComponent } from 'src/app/components/unfulfilled-sale/unfulfilled-sale.component';
import { Cart } from 'src/app/_classes/cart.class';
import { CartProduct } from 'src/app/_classes/cart_product.class';
import { Openclose } from 'src/app/_classes/openclose.class';
import { Payment } from 'src/app/_classes/payment.class';
import { Product } from 'src/app/_classes/product.class';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.page.html',
  styleUrls: ['./sell.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SellPage implements OnInit {
  title:string = 'Sell Panel';
  user: any;
  keyword: string = '';
  optionAutoComplete: AutoCompleteOptions;
  products:Product[] = [];
  form:FormGroup;
  isSubmitted: boolean = false;
  util = UtilFunc;
  is_mobile: boolean = true;
  label_void_item: string = 'Void Item';
  selectedProduct:CartProduct = null;
  passed_password: boolean = false;
  allow_discount: boolean = false;
  @ViewChild('searchbar') searchbar: AutoCompleteComponent;

  constructor(
    private platform:Platform,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    public providerProduct: SearchProductService,
    private loading: LoadingService,
    private authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService,
    private alertService: AlertService,
    private utilService: UtilService,
    private nav: NavController,
    private fb: FormBuilder,
    public payment: Payment,
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(user.role){
        this.allow_discount = user.role.permissions.includes('apply_discounts');
      }
    })
    this.optionAutoComplete = new AutoCompleteOptions();
    this.optionAutoComplete.autocomplete = 'on';
    this.optionAutoComplete.debounce = 750;
    this.optionAutoComplete.placeholder = 'Barcode / Name';

    this.form = this.fb.group({
      open_value: ['', [Validators.required, Validators.min(1)]],
      open_note: ['']
    })
    this.payment.load();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      let width = this.platform.width();
      this.is_mobile = width <= 576;
    })
  }

  ionViewDidEnter() {
    this.checkInitCart();
  }

  public get openClose():Openclose {
    return this.cartService.openClose;
  }

  public get cart():Cart{
    return this.cartService.cart;
  }

  selProduct(event) {
    if(event.product) {
      this.addToCart(event.product)
    }
    this.searchbar.clearValue();
    this.focusKeyword();
  }

  checkInitCart() {
    if(this.cartService.openClose._id) {
      if(this.cartService.new_sale) {
        let action = this.cartService.action;
        if(this.cart._id && !(this.cartService.new_sale.cart_mode == 'return' && this.cart.cart_mode == 'return' && this.cartService.new_sale.origin_sale_number == this.cart.origin_sale_number)) {
          let title = 'Hold up! You currently have a sale in progress',
              msg = 'You have a sale on the Sell screen that hasn’t been completed. You can choose to return to that sale to complete it, or save that sale and continue with this one.';
          this.alertService.presentAlertConfirm(title, msg, () => {
            if(this.cartService.cart.sale_status == 'new') this.cartService.cart.sale_status = 'parked';
            this.cartService.cart.save(()=>{
              this.loadCartFromSale(action);
            })
          }, () => {
            this.cartService.new_sale = null;
            this.cartService.action = null;
          }, 'Save and Continue', 'Return to Sale in Progress');
        } else {
          this.loadCartFromSale(action);
        }
      }
    }
  }

  loadCartFromSale(action: string) {
    this.cartService.loadCartFromSale();
    if(action == 'return' && !this.cart.customer) {
      this.openCustomer(result => {
        this.initCart(action);
      })
    } else {
      this.initCart(action);
    }
  }

  focusKeyword() {
    this.searchbar.setFocus();
  }

  initCart(action?:string) {
    this.cartService.initCart();
    if(action == 'return') {
      this.utilService.get('sale/sale', {sale_number: this.cart.origin_sale_number}).subscribe(result => {
        if(result && result.body) {
          const cart = result.body[0];
          if(cart.returned) {
            this.toastService.show('Already reaturned sale.');
            this.cartService.cart.init();
          } else {
            if(!this.cart._id) this.cartService.cart.save();
          }
        } else {
          this.toastService.show('No existing original sale.');
          this.cartService.cart.init();
        }
      })
    } else if(action == 'void') {
      if(this.cart.voided) {
        this.toastService.show('Already voided sale.');
        this.cartService.cart.init();
      } else {
        this.cartService.cart.save();
      }
    }
  }

  addToCart(product:Product) {
    if (!this.openClose._id || this.cart.isRefund) {
      this.toastService.show('On Return Items, you can\'t add new product to cart.');
      return;
    }
    this.cartService.addToCart(product);
  }

  openAddToCart() {
    if (!this.openClose._id || this.cart.isRefund) {
      this.toastService.show('On Return Items, you can\'t add new product to cart.');
      return;
    }
    this.nav.navigateForward(['/add-to-cart']);
  }

  public get selected_cart_product():CartProduct {
    let sel_cart_product = this.cart.getSelectedBundleProduct();
    return this.cart.getProductsFromBundle(sel_cart_product);
  }

  selCartProduct(product:CartProduct) {
    product.checked = !product.checked;
    this.deSelectOther(product);
  }

  deSelectOther(product:CartProduct) {
    if(product.checked) {
      this.cartService.cart.deSelectOtherBundleProducts(product);
      if(this.cart.isVoid) {
        this.label_void_item = product.void ? 'Cancel Void' : 'Void Item';
      }
    } else {
      this.label_void_item = 'Void Item';
    }
  }

  removeProductFromCart() {
    if(!this.selected_cart_product) return;
    if(this.cart.store_info.preferences.confirm_delete_product) {
      this.alertService.presentConfirmDelete('Item', () => {
        this.cartService.removeProductFromCart(this.selected_cart_product);
      })
    } else {
      this.cartService.removeProductFromCart(this.selected_cart_product);
    }
  }

  async openCustomer(callback?:Function) {
    const popover = await this.popoverController.create({
      component: ChooseCustomerComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: {c_customer: this.cart.customer}
    });

    popover.onDidDismiss().then(result => {
      let a = false;
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process && data.customer) {
          this.cartService.cart.customer = data.customer;
          this.cartService.cart.save();
          a = true;
        }
      }
      if(callback) callback(a);
    });
    await popover.present();
  }

  async changePW(cart_product: CartProduct, mode:string) {
    let product = this.cart.getProductsFromBundle(cart_product);
    let data:any;
    if(product) {
      if(mode == 'price') data = {price: product.prompt_price};
      if(mode == 'weight') data = {weight: product.weight, blank_cup_weight: product.product.data.blank_cup_weight};
      if(mode == 'serial') data = {serial: product.serial};
      await this.cartService.openPW(product, data);
    }
  }

  checkButtonStatus(button:string) {
    if(!this.cartService.isOpenRegister) return false;
    switch(button) {
      case 'view_sales':
        return true;
        break;
      case 'print_last_tran':
        if(!this.cartService.lastClose) return false;
        break;
      case 'park_sale':
      case 'discard_sale':
        if(!this.cart.is_manage_sale || Constants.paid_status.includes(this.cart.sale_status)) return false;
        break;
      case 'quote_sale':
      case 'mark_as_unfulfilled':
        if(!this.cart.is_manage_sale || this.cart.isRefund || Constants.paid_status.includes(this.cart.sale_status)) return false
        break;
      case 'add_note':
      case 'retrieve_sale':
        return true;
        break;
      case 'add_sale_discount':
        if(this.cart.isRefund) return false;
        break;
      case 'exchange_minus':
        if(this.cart.isRefund || !this.selected_cart_product || Constants.paid_status.includes(this.cart.sale_status)
          || this.selected_cart_product.product.data.has_no_price) return false;
        break;
      case 'qty':
      case 'delete':
        if(!this.selected_cart_product || this.cart.isRefund || Constants.paid_status.includes(this.cart.sale_status)) return false;
        break;
      case 'add_discount':
        if(!this.selected_cart_product || this.cart.isRefund || Constants.paid_status.includes(this.cart.sale_status)
          || this.selected_cart_product.product.data.has_no_price) return false;
        break;
      case 'cash':
      case 'credit':
      case 'debit':
      case 'check':
      case 'foodstamp':
      case 'ebt_cash':
      case 'gift':
      case 'rewards':
      case 'charge_account':
        if(!this.cart.able_to_pay) return false;
        break;
      case 'layby':
      case 'on_account':
        if(this.cart.isRefund || !this.cart.customer || this.cart.total_to_pay!=this.cart.totalIncl
          || !this.cart.able_to_pay || Constants.paid_status.includes(this.cart.sale_status) || this.cart.sale_status == 'layby') return false;
        break;
      case 'store_credit':
        if(!this.cart.customer || (!this.cart.isRefund && this.cart.customer && this.cart.customer.data.credit<=0) || !this.cart.able_to_pay)
          return false;
        break;
      case 'void_sale':
        case 'return_items':
          if(['parked' ,'new'].includes(this.cart.sale_status) || this.cart.voided_payments.length>0) return false;
          break;
      case 'void_item':
        if(['parked' ,'new'].includes(this.cart.sale_status) || !this.selected_cart_product) return false;
        break;
      default:
        return false;
    }
    return true;
  }

  async openActionSheet(mode:string) {
    const headers = {
      sales: 'Sale Actions', items: 'Item Actions', payment: 'Payment Actions'
    };
    const buttons = {
      sales: [
        {text: 'View Sales', cssClass: 'orange', action: 'view_sales'},
        {text: 'Retrieve Sale', cssClass: 'orange', action: 'retrieve_sale'},
        {text: 'Park Sale', cssClass: 'orange', action: 'park_sale'},
        {text: 'Quote Sale', cssClass: 'orange', action: 'quote_sale'},
        {text: 'Mark as Unfulfilled', cssClass: 'orange', action: 'mark_as_unfulfilled'},
        {text: 'Discard Sale', cssClass: 'danger', action: 'discard_sale'},
        {text: 'Void Sale', cssClass: 'danger', action: 'void_sale'},
        {text: 'Add Discount', cssClass: '', action: 'add_sale_discount'},
        {text: 'Add Note', cssClass: '', action: 'add_note'},
        {text: 'Cancel', icon: 'close', role: 'cancel'}
      ],
      items: [
        {text: 'Exchange Minus', cssClass: '', action: 'exchange_minus'},
        {text: 'Add Discount', cssClass:'', action: 'add_discount'},
        {text: 'Quantity', cssClass: '', action: 'qty'},
        {text: 'Delete', cssClass: 'danger', action: 'delete'},
        {text: this.label_void_item, cssClass: 'danger', action: 'void_item'},
        {text: 'Return Items', cssClass: 'danger', action: 'return_items'},
        {text: 'Cancel', icon: 'close', role: 'cancel'}
      ],
      payment: []
    }
    for(let p of this.payment.payment_buttons) {
      let css = 'blue';
      if(this.isRefundButton(p.code)) css = 'danger';
      buttons.payment.push({
        text: p.label, cssClass: css, action: p.code
      })
    }
    buttons.payment.push({text: 'Cancel', icon: 'close', role: 'cancel'});


    if(mode == 'sales') {
      if(this.cart.discount.value) {
        let button = buttons.sales.find(item => item.action == 'add_sale_discount');
        button.text = 'Change Discount';
      }
    }
    if(mode == 'items') {
      if(this.selected_cart_product && this.selected_cart_product.discount.value) {
        let button = buttons.items.find(item => item.action == 'add_discount');
        button.text = 'Change Discount';
      }
    }

    for(let b of buttons[mode]) {
      if(typeof b.action != 'undefined') {
        let action = b.action;
        let status = this.checkButtonStatus(action);
        if(!status) b.cssClass += ' disabled';
        if(mode == 'sales' || mode == 'items') {
          b.handler = () => {
            this.doAction(action);
          }
        } else {
          b.handler = () => {
            this.startPay(action);
          }
        }
        delete b.action;
      }
    }
    const actionSheet = await this.actionSheetController.create({
      header: headers[mode],
      cssClass: 'custom-action-sheet',
      buttons: buttons[mode]
    });

    await actionSheet.present();
  }

  doAction(action:string) {
    let status = this.checkButtonStatus(action);
    if(!status) return false;
    switch(action) {
      case 'view_sales':
        this.nav.navigateForward(['/main/sell/sales-history']);
        break;
      case 'delete':
        this.removeProductFromCart();
        break;
      case 'add_note':
        this.openNote();
        break;
      case 'add_sale_discount':
        this.addSaleDiscount();
        break;
      case 'exchange_minus':
        this.exchangeMinus();
        break;
      case 'add_discount':
        this.addDiscount();
        break;
      case 'qty':
        this.updateQuantity();
        break;
      case 'discard_sale':
        this.discardSale();
        break;
      case 'park_sale':
        this.parkSale();
        break;
      case 'quote_sale':
        this.quoteSale();
        break;
      case 'mark_as_unfulfilled':
        this.markUnfulfilled();
        break;
      case 'retrieve_sale':
        this.nav.navigateForward(['/retrieve-sale']);
        break;
      case 'void_item':
        this.voidItem();
        break;
      case 'return_items':
        this.returnItems();
        break;
    }
    return true;
  }

  async openRegister(){
    this.isSubmitted = true;
    if(this.form.valid){
      const data = this.form.value;
      await this.loading.create();
      this.cartService.openRegister(data, async result => {
        await this.loading.dismiss();
        if(result) {
          this.toastService.show(Constants.message.successOpenRegister);
        } else {
          this.toastService.show(Constants.message.failedSave);
        }
      })
    }
  }

  async openNote(msg?:string, item?:string, callback?:Function) {
    const data = {note: this.cart.note, msg: msg, item: item};
    const popover = await this.popoverController.create({
      component: SaleNoteComponent,
      // event: ev,
      cssClass: 'popover_custom',
      translucent: true,
      componentProps: {data: data}
    });

    popover.onDidDismiss().then(result => {
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process && data.note) {
          this.cartService.cart.note = data.note;
          this.cartService.cart.save();
          if(callback) callback();
        }
      }
    });
    await popover.present();
  }

  addSaleDiscount(): void {
    if(!this.allow_discount) {
      this.toastService.show(Constants.message.notAllowedDiscount);
      return;
    }
    if(!this.passed_password) {
      this.confirmPassword(() => {
        this._addDiscount(true);
      });
    } else {
      this._addDiscount(true);
    }
  }

  addDiscount(): void {
    if(!this.selected_cart_product) return;
    if(!this.allow_discount) {
      this.toastService.show(Constants.message.notAllowedDiscount);
      return;
    }
    if(this.selected_cart_product.product.data.none_discount_item) {
      this.toastService.show('This product is not discountable.');
      return;
    }
    if(!this.passed_password) {
      this.confirmPassword(() => {
        this._addDiscount(false);
      });
    } else {
      this._addDiscount(false);
    }
  }

  changeDiscountItem(product:CartProduct) {
    product.checked = true;
    this.deSelectOther(product);
    this.addDiscount();
  }

  async _addDiscount(is_global:boolean) {
    let data = {discount: this.cart.discount, is_global: is_global};
    if(!is_global) data.discount = this.selected_cart_product.discount;
    const popover = await this.popoverController.create({
      component: DiscountComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: data
    });

    popover.onDidDismiss().then(result => {
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process) {
          if(is_global) {
            this.cartService.cart.discount = data.discount;
            this.cartService.cart.setGlobalDiscount();
          } else {
            let product:CartProduct = this.cart.products.find(item => item == this.selected_cart_product);
            product.discount = data.discount;
          }
          this.cartService.cart.save();
        }
      }
    });
    await popover.present();
  }

  async confirmPassword(callback?:Function) {
    const popover = await this.popoverController.create({
      component: ConfirmPasswordComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: {private_web_address: this.user.private_web_address, email: this.user.email}
    });

    popover.onDidDismiss().then(result => {
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process) {
          this.passed_password = true;
          if(callback) callback();
        }
      }
    });
    await popover.present();
  }

  exchangeMinus() {
    if(!this.selected_cart_product) return;
    this.selected_cart_product.sign *= -1;
    this.cartService.cart.save();
  }

  async updateQuantity() {
    if(!this.selected_cart_product) return;
    const popover = await this.popoverController.create({
      component: QuantityComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: {quantity: this.selected_cart_product.qty}
    });

    popover.onDidDismiss().then(result => {
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process) {
          this.selected_cart_product.qty = data.qty;
          this.cartService.cart.save();
        }
      }
    });
    await popover.present();
  }

  discardSale() {
    if(this.cart.products.length == 0 && !this.cart._id) {
      return;
    }
    if(this.cart.store_info.preferences.confirm_discard_sale) {
      this.alertService.presentAlertConfirm('Confirm discard sale', 'Are you sure to want to discard this sale?', () => {
        this.cartService.cart.deleteSale(() => {
          this.cartService.newCart();
        })
      })
    } else {
      this.cartService.cart.deleteSale(() => {
        this.cartService.newCart();
      })
    }
  }

  parkSale() {
    this.openNote(Constants.message.sale_note.park, 'Park', () => {
      this.cartService.cart.sale_status = 'parked';
      this.cartService.cart.save(() => {
        this.toastService.show(Constants.message.sale.parked);
        this.cartService.cart.delete(() => {
          this.cartService.newCart();
        })
      });
    })
  }

  quoteSale() {
    this.openNote(Constants.message.sale_note.quote, 'Quote', () => {
      this.cartService.cart.sale_status = 'quoted';
      this.cartService.cart.save(() => {
        this.toastService.show(Constants.message.sale.quote);
        this.cartService.cart.delete(() => {
          this.cartService.newCart();
        })
      });
    })
  }

  async markUnfulfilled() {
    const popover = await this.popoverController.create({
      component: UnfulfilledSaleComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: {note: this.cart.note}
    });

    popover.onDidDismiss().then(result => {
      if(typeof result.data != 'undefined') {
        let data = result.data;
        if(data.process) {
          let mode = data.fulfillment.mode, status = mode + '_unfulfilled';
          this.cartService.cart.sale_status = status;
          this.cartService.cart.fulfillment = data.fulfillment;
          this.cartService.cart.save(() => {
            this.toastService.show(Constants.message.sale[status]);
            this.cartService.cart.delete(() => {
              this.cartService.newCart();
            })
          });
        }
      }
    });
    await popover.present();
  }

  isRefundButton(code:string) {
    return (!['layby', 'store_credit', 'on_account'].includes(code)) && (this.cart.isRefund || this.cart.cart_mode=='void');
  }

  async startPay(pay_mode:string) {
    if(pay_mode == 'cash' && !this.cart.isRefund && !this.cart.isVoid) {
      const popover = await this.popoverController.create({
        component: PayAmountComponent,
        // event: ev,
        cssClass: 'popover_custom fixed-width',
        translucent: true,
        componentProps: {total_amount_to_pay: this.cart.total_to_pay}
      });

      popover.onDidDismiss().then(result => {
        if(typeof result.data != 'undefined') {
          let data = result.data;
          if(data.process) {
            if(this.cart.isRefund && data.amount < 0 || !this.cart.isRefund && data.amount > 0) {
              this.pay(pay_mode, data.amount);
            }
          }
        }
      });
      await popover.present();
    } else {
      this.pay(pay_mode, this.cart.total_to_pay);
    }
  }

  pay(pay_mode: string, pay_amount: number): void {
    if(this.cart.isRefund) {
      this.refund(pay_mode, pay_amount);
      return;
    }
    if(this.cart.isVoid) {
      this.voidItems(pay_mode);
      return;
    }
    if (pay_amount <= 0) {
      return;
    }
    this.cartService.checkProductsInventory(() => {
      if(this.cart.products.length == 0) {
        this.toastService.show(Constants.message.invalidCartProducts);
      } else {
        if(!['cash', 'store_credit'].includes(pay_mode)) {
          // if(this.cart.store_info.preferences.confirm_pay) {
          //   this.confirmPay(pay_mode, () => {
          //     this._pay(pay_mode, pay_amount);
          //   })
          // } else {
            this._pay(pay_mode, pay_amount);
          // }
        } else if(pay_mode == 'store_credit'){
          if(this.cart.customer.data.credit < pay_amount) {
            let title = 'Pay ' + this.cart.customer.credit_str + ' with Store Credit';
            let msg = 'You can only redeem up to the value of your current store credit balance. You may still continue with this as a partial payment, then choose another payment method for the remaining balance.';
            this.alertService.presentAlertConfirm(title, msg, () => {
              pay_amount = this.cart.customer.data.credit;
              this._pay(pay_mode, pay_amount);
            }, null, 'Make partial payment', 'Choose a different payment type');
          } else {
            this._pay(pay_mode, pay_amount);
          }
        } else {
          this._pay(pay_mode, pay_amount);
        }
      }
    })
  }

  refund(pay_mode: string, pay_amount: number): void {
    if (pay_amount >= 0) {
      return;
    }
    this._pay(pay_mode, pay_amount);
  }

  voidItems(pay_mode:string) {
    let pay_amount = this.cart.voided_amount;
    if(pay_amount > 0) {
      this._pay(pay_mode, pay_amount);
    }
  }

  private _pay(pay_mode: string, pay_amount:number) {
    this.cart.pay(pay_mode, pay_amount);
    this.cartService.processCustomerBalance(pay_mode, pay_amount);
    if(this.cart.able_to_complete) {
      if(!['layby'].includes(pay_mode)) {
        if(!this.cart.isVoid) {
          for(let product of this.cart.products) {
            product.updateInventory();
          }
        } else {
          for(let p of this.cart.products) {
            if(p.void) {
              let pp = new CartProduct(p.product, p.variant_id);
              pp.loadDetails(p);
              pp.qty *= -1;
              pp.updateInventory();
            }
          }
        }
      }
      this.completeSale()
    } else {
      this.cartService.cart.save();
    }
  }

  completeSale() {
    this.cartService.completeSale(async () => {
      this.toastService.show(Constants.message.successComplete);
      // this.btnPrintTran.nativeElement.click();
      if(this.cart.payment_status == 'cash') {
        const popover = await this.popoverController.create({
          component: PayChangeComponent,
          // event: ev,
          cssClass: 'popover_custom fixed-width',
          translucent: true,
          componentProps: {change: UtilFunc.getPriceWithCurrency(this.cart.change)}
        });

        popover.onDidDismiss().then(result => {
          this.cartService.newCart();
        });
        await popover.present();
      } else {
        this.cartService.newCart();
      }
    })
  }

  voidItem() {
    if(!this.selected_cart_product) return;
    this.selected_cart_product.void = !this.selected_cart_product.void;
    this.label_void_item = this.selected_cart_product.void ? 'Cancel Void' : 'Void Item';
  }

  returnItems() {
    this.cartService.loadCart(this.cart._id, 'return', () => {
      this.checkInitCart();
    })
  }

  get floatInput(): any {return this.form.get('open_value'); }
  get floatInputError(): string | void {
    if (this.floatInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.floatInput.hasError('min')) { return Constants.message.invalidMinValue.replace('?', Constants.open_value.min.toString()); }
  }
}
