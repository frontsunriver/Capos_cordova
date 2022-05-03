import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, PopoverController } from '@ionic/angular';
import { AutoCompleteComponent, AutoCompleteOptions } from 'ionic4-auto-complete';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { OrderService } from 'src/app/_services/order.service';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { IOrderProduct, Order } from 'src/app/_classes/order.class';
import { EditVariantQtyComponent } from '../edit-variant-qty/edit-variant-qty.component';
import { Product } from 'src/app/_classes/product.class';

@Component({
  selector: 'app-edit-order-stock-content',
  templateUrl: './edit-order-stock-content.component.html',
  styleUrls: ['./edit-order-stock-content.component.scss'],
})
export class EditOrderStockContentComponent implements OnInit {
  
  form: FormGroup;
  suppliers = [];
  outlets = [];
  isSubmitted: boolean = false;
  keyword: string = '';
  util = UtilFunc;  
  optionAutoComplete: AutoCompleteOptions;
  @ViewChild('searchbar') searchbar: AutoCompleteComponent;  
  supplier_label = {
    purchase: 'Supplier',
    receive: 'Supplier',
    return: 'Delivery to'
  }
  deliver_label = {
    purchase: 'Delivery to',
    receive: 'Delivered to',
    return: 'Return from'
  }
  order_card_desc = {
    purchase: 'Adding details for this order helps you stay on top of all your orders and main data',
    receive: 'Adding details for this order helps you stay on top of all your orders and main data',
    return: ''
  }
  order_number_label = {
    purchase: 'Order Number',
    receive: 'Order Number',
    return: 'Return Number'
  }
  product_card_desc = {
    purchase: 'Choose products to add to this order',
    receive: 'Choose products to receive by searching or scanning.',
    return: 'Choose products to return by searching or scanning.'
  }

  constructor(
    private nav: NavController,
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private orderService: OrderService,
    private fb: FormBuilder,
    public providerProduct: SearchProductService,
    private popoverController: PopoverController,
    private loading: LoadingService
  ) {
    this.optionAutoComplete = new AutoCompleteOptions();
    this.optionAutoComplete.autocomplete = 'on';
    this.optionAutoComplete.debounce = 750;
    this.optionAutoComplete.placeholder = 'Barcode / Name';

    this.form = this.fb.group({
      supplier: ['', [Validators.required]],
      deliver_to: ['', [Validators.required]],
      invoice_number: [''],
      delivery_date: [''],
      order_number: [UtilFunc.genRandomOrderString(8), [Validators.required]],
      note: ['']
    });

    this.utilService.get('product/supplier', {}).subscribe(result => {
      this.suppliers = result.body;
    });

    this.utilService.get('sell/outlet', {}).subscribe(result => {
      this.outlets = result.body;
    });
  }

  ngOnInit() {    
    
  }

  loadFormData() {
    if(this.order._id) {      
      Object.keys(this.form.value).forEach(key => {
        if(['supplier', 'deliver_to'].includes(key)) {
          this.form.get(key).setValue(this.order.data[key]._id);
        } else {
          this.form.get(key).setValue(this.order.data[key])
        }
      })
    }
  }

  public get order():Order {
    return this.orderService.order;
  }

  public get isEdit():boolean {
    return this.order._id != '';
  }

  back() {
    this.nav.back();
  }

  selProduct(event) {
    if(event.product) {
      this.orderService.addProduct(event.product)
    }
    this.searchbar.clearValue();
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

  removeProduct(index: number) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this product?', () => {
      this.order.removeProduct(index);  
    })
  }

  submit(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    let valid_products = 0;
    for(let p of this.order.data.products) {
      if(p.qty>0) valid_products++;
    }
    if(!valid_products) {
      this.toastService.show('Please add at least a product');
      return;
    }
    const data = this.form.value;
    this.orderService.save(data, () => {
      this.toastService.show(Constants.message.successSaved);
      this.nav.navigateBack(['main/stock-control/manage-orders']);
    }, () => {
      this.toastService.show(Constants.message.failedSave);
    })
  }

  saveAndReceive() {
    this.alertService.presentAlertConfirm('Confirm Receive Stock', 'Are you really want to receive this stock?', () => {
      this.order.data.status = 'received';
      this.submit();
    })
  }

  openAddToOrder() {
    this.nav.navigateForward(['add-to-order']);
  }

  async purchaseByReorder() {    
    await this.loading.create();
    this.utilService.get('product/product', {range: 'reorder'}).subscribe(async result => {
      await this.loading.dismiss();
      if(result && result.body.length > 0) {
        for(let p of result.body) {
          let product = new Product(this.authService, this.utilService);
          product.loadDetails(p);
          if(!p.variant_inv) {
            this.order.addProduct(Order.getNewOrderProduct(product));
          } else {
            for(let vp of product.data.variant_products) {
              if(vp.inventory < vp.reorder_point) {
                this.order.addProduct(Order.getNewOrderProduct(product, vp._id));
              }
            }
          }
        }
      } else {
        let title = 'None of your products have inventory levels below their reorder points.';
        let msg = 'This could be because your products haven’t gone below the reorder point or because a reorder point hasn’t been set.'; 
        this.alertService.presentAlert(title, msg);        
      }
    }, async error => {
      await this.loading.dismiss();
    })
  }

  getProductInventory(product:IOrderProduct){
    return Order.getProductInventory(product);
  }

  public get supplierInput() {return this.form.get('supplier')}
  public get supplierInputError() {
    if(this.supplierInput.hasError('required')) return Constants.message.requiredField;
  }
  public get deliverToInput() {return this.form.get('deliver_to')}
  public get deliverToInputError() {
    if(this.deliverToInput.hasError('required')) return Constants.message.requiredField;
  }

  public get orderNumberInput() {return this.form.get('order_number')}
  public get orderNumberInputError() {
    if(this.orderNumberInput.hasError('required')) return Constants.message.requiredField;
  }
}
