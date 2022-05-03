import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Bundle } from 'src/app/_classes/bundle.class';
import { Constants } from 'src/app/_configs/constants';
import { ToastService } from 'src/app/_services/toast.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { AutoCompleteComponent, AutoCompleteOptions } from 'ionic4-auto-complete';
import { BundleService } from 'src/app/_services/bundle.service';
import { AlertService } from 'src/app/_services/alert.service';

@Component({
  selector: 'app-edit-bundle',
  templateUrl: './edit-bundle.component.html',
  styleUrls: ['./edit-bundle.component.scss'],
})
export class EditBundleComponent implements OnInit {
  title:string = 'Add New Bundle';  
  form: FormGroup;
  keyword: string = '';
  optionAutoComplete: AutoCompleteOptions;
  isSubmitted: boolean = false;
  @ViewChild('searchbar') searchbar: AutoCompleteComponent; 

  constructor(
    private toastService: ToastService,
    private alertService: AlertService,
    private nav: NavController,
    private fb: FormBuilder,
    public providerProduct: SearchProductService,
    private bundleService: BundleService
  ) {
    this.optionAutoComplete = new AutoCompleteOptions();
    this.optionAutoComplete.autocomplete = 'on';
    this.optionAutoComplete.debounce = 750;
    this.optionAutoComplete.placeholder = 'Barcode / Name';
    
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      count: ['', [Validators.required]],
      price: ['', [Validators.required]],
      discount: ['', [Validators.required]]      
    })
  }

  ngOnInit() {
    this.loadBundleData();  
  }

  public get bundle():Bundle {
    return this.bundleService.bundle;
  }

  loadBundleData() {    
    if(this.bundle._id) {
      this.title = 'Edit Bundle';
      Object.keys(this.form.value).forEach(key => {
        this.form.get(key).setValue(this.bundle[key]);
      })
    }
  }

  selProduct(event) {
    if(event.product) {
      this.bundleService.addProduct(event.product)
    }
    this.searchbar.clearValue();    
  }

  removeProduct(index: number) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this product?', () => {
      this.bundleService.removeProduct(index);        
    })    
  }

  hintName() {
    let result = '';
    if(this.form.get('count').value) result += this.form.get('count').value;
    if(this.form.get('price').value) result += ' For ' + UtilFunc.getPriceWithCurrency(this.form.get('price').value);
    this.form.get('name').setValue(result);
  }

  openAddToBundle() {
    this.nav.navigateForward(['/add-to-bundle']);
  }

  submit() {
    this.isSubmitted = true;
    if(this.form.valid) {
      this.bundleService.bundle.name = this.nameInput.value;      
      this.bundleService.bundle.count = this.countInput.value;      
      this.bundleService.bundle.price = this.priceInput.value;      
      this.bundleService.bundle.discount = this.discountInput.value;  
      this.bundle.save((result) => {
        this.toastService.show(Constants.message.successSaved);
        this.bundleService.changed = true;
        this.nav.navigateBack(['main/product/mix-and-match']);        
      }, () => {
        this.toastService.show(Constants.message.failedSave);
      })
    }
  }

  back() {
    this.nav.navigateBack(['main/product/mix-and-match']);
  }

  get selectedProduct(): any {return this.form.get('selectedProduct'); }
  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get priceInput(): any {return this.form.get('price'); }
  get priceInputError(): string {
    if (this.priceInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get countInput(): any {return this.form.get('count'); }
  get countInputError(): string {
    if (this.countInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get discountInput(): any {return this.form.get('discount'); }
  get discountInputError(): string {
    if (this.discountInput.hasError('required')) {return Constants.message.requiredField; }    
  }
}
