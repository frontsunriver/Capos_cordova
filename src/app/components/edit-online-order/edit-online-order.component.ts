import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { Onlineorder } from 'src/app/_classes/onlineorder.class';
import { Constants } from 'src/app/_configs/constants';
import { OnlineOrderService } from 'src/app/_services/online-order.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilService } from 'src/app/_services/util.service';
import { AutoCompleteComponent, AutoCompleteOptions } from 'ionic4-auto-complete';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { DiscountComponent } from '../discount/discount.component';
import { ConfirmPasswordComponent } from '../confirm-password/confirm-password.component';
import { CartProduct } from 'src/app/_classes/cart_product.class';
import { EditOnlineOrderProductComponent } from '../edit-online-order-product/edit-online-order-product.component';
import { LoadingService } from 'src/app/_services/loading.service';
import { CountryModel } from 'src/app/_models/country-model';

@Component({
  selector: 'app-edit-online-order',
  templateUrl: './edit-online-order.component.html',
  styleUrls: ['./edit-online-order.component.scss'],
})
export class EditOnlineOrderComponent implements OnInit {
  
  order_status = Constants.order_status;
  payment_statuses = Constants.payment_status;
  util = UtilFunc;
  user:any;
  frmPayment: FormGroup;
  frmCustomer: FormGroup;
  isSubmitted = {
    payment: false,
    customer: false
  }
  allow_discount: boolean = false;
  passed_password: boolean = false;
  countries:CountryModel[] = [];
  keyword: string = '';
  optionAutoComplete: AutoCompleteOptions;  
  @ViewChild('searchbar') searchbar: AutoCompleteComponent; 

  constructor(
    private onlineOrderService: OnlineOrderService,
    private authService: AuthService,
    private utilService: UtilService,
    private nav: NavController,
    public providerProduct: SearchProductService,
    private alertService: AlertService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private popoverController: PopoverController,
    private loading: LoadingService
  ) {
    this.optionAutoComplete = new AutoCompleteOptions();
    this.optionAutoComplete.autocomplete = 'on';
    this.optionAutoComplete.debounce = 750;
    this.optionAutoComplete.placeholder = 'Barcode / Name';

    this.frmPayment = this.fb.group({
      created_at: ['', [Validators.required]],
      type: ['', [Validators.required]],
      amount: ['', [Validators.required]]
    });

    this.frmCustomer = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.countries = this.utilService.countries;   

    this.authService.currentUser.subscribe(user => {        
      this.user = user;     
      if(user.role){
        this.allow_discount = user.role.permissions.includes('apply_discounts');      
      }
    }); 
  }

  ngOnInit() {
    this.onlineOrderService.editable = true;
  }

  ionViewDidEnter() {
    this.frmCustomer.get('name').setValue(this.order.customer.name);
    this.frmCustomer.get('email').setValue(this.order.customer.email);
  }

  public get order():Onlineorder {
    return this.onlineOrderService.order;
  }

  public get title():string {
    return 'Edit Order #' + this.order.reference;
  }

  updateStatus() {      
    this.alertService.presentAlertConfirm('Confirm Update Order Status', 'Are you really want to update status of this order?', () => {
      let status_history = {
        status: this.order.status,
        created_at: (new Date()).toString()
      }        
      this.order.status_history.push(status_history);    
    })    
  }

  updatePaymentStatus() {        
    this.alertService.presentAlertConfirm('Confirm Update Payment Status', 'Are you really want to update payment status of this order?', () => {
      let status_history = {
        status: this.order.payment_status,
        created_at: (new Date()).toString()
      }        
      this.order.payment_status_history.push(status_history);
    })        
  }

  addPayment() {
    this.isSubmitted.payment = true;
    if(this.frmPayment.valid) {      
      let data = this.frmPayment.value;
      this.order.pay(data.type, data.amount, data.created_at);      
      Object.keys(data).forEach(key => {
        this.frmPayment.get(key).setValue('');
      })
      this.isSubmitted.payment = false;
    }
  }

  removePayment(index:number) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this payment?', () => {
      this.order.removePayment(index);
    })       
  }

  addDiscount(): void {
    if(!this.allow_discount) {
      this.toastService.show(Constants.message.notAllowedDiscount);
      return;
    }
    if(!this.passed_password) {
      this.confirmPassword(() => {
        this._addDiscount();
      });      
    } else {
      this._addDiscount();
    }
  }

  async _addDiscount() {
    let data = {discount: this.order.discount, is_global: true};    
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
          this.order.discount = data.discount;
          this.order.setGlobalDiscount();          
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

  selProduct(event) {
    if(event.product) {
      this.onlineOrderService.addProduct(event.product)
    }
    this.searchbar.clearValue();
    this.searchbar.setFocus(); 
  }

  removeProduct(index: number) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this product?', () => {
      this.onlineOrderService.removeProduct(index);
    })
  }

  async editProduct(product:CartProduct) {
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

  openAddToOrder() {
    this.nav.navigateForward(['add-to-online-order']);
  }

  async submit() {
    await this.loading.create();
    this.order.save(async () => {
      await this.loading.dismiss();
      this.onlineOrderService.changed = true;
      this.nav.back();
    }, async () => {
      await this.loading.dismiss();
    })
  }

  back() {
    this.nav.back();
  }

  get dateInput(): any {return this.frmPayment.get('created_at'); }
  get dateInputError(): string {    
    if (this.dateInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get typeInput(): any {return this.frmPayment.get('type'); }
  get typeInputError(): string {    
    if (this.typeInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get amountInput(): any {return this.frmPayment.get('amount'); }
  get amountInputError(): string {    
    if (this.amountInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get nameInput(): any {return this.frmCustomer.get('name'); }
  get nameInputError(): string {    
    if (this.nameInput.hasError('required')) { return Constants.message.requiredField; }
  }  

  get emailInput(): any {return this.frmCustomer.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }   
  }

}
