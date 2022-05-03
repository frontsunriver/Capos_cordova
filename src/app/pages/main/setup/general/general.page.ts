import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Store } from 'src/app/_classes/store.class';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { ADDRESS } from "src/app/_helpers/util.helper";
import { CurrencyModel } from 'src/app/_models/currency-model';
import { CountryModel } from 'src/app/_models/country-model';

@Component({
  selector: 'app-general',
  templateUrl: './general.page.html',
  styleUrls: ['./general.page.scss'],  
})
export class GeneralPage implements OnInit {
  title = 'General Setup';
  cur_tab: string = 'store';
  frmStore: FormGroup;
  frmContact: FormGroup;
  frmAddress: FormGroup;
  duplicate_error = {
    store_name: false,
    domain_name: false,
    email: false
  };
  is_submitted = {
    store: false,
    contact: false,
    address: false
  };
  currencies:CurrencyModel[] = [];
  securities = Constants.securities;
  social_link = {
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  }
  countries:CountryModel[] = [];

  constructor(
    private fb: FormBuilder,    
    private utilService: UtilService,
    private toastService: ToastService,
    public store: Store,
    private loading: LoadingService
  ) {
    
    this.frmStore = this.fb.group({
      private_web_address: [''],
      store_name:['', [Validators.required]],
      default_currency: ['', [Validators.required]],
      default_tax: ['', [Validators.required]],
      template:[''],
      domain_name: ['', [Validators.required]],
      user_switch_security: [1]
    });

    this.frmContact = this.fb.group({
      first_name:['', [Validators.required]],
      last_name:['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      facebook:[''],
      twitter:[''],
      linkedin:[''],
      youtube:['']
    });

    this.frmAddress = this.fb.group({
      physical_address: this.fb.group(ADDRESS),
      postal_address: this.fb.group(ADDRESS)
    })
  }

  ngOnInit() {
    this.currencies = this.utilService.currencies;
    this.countries = this.utilService.countries;    
    this.store.load(() => {
      Object.keys(this.frmStore.value).forEach(key => {
        if(key == 'default_currency') {
          this.frmStore.get(key).setValue(this.store[key] ? this.store[key]._id: null);    
        } else {
          this.frmStore.get(key).setValue(this.store[key]);
        }
      }) 
      this.social_link = this.store.social_link;
      Object.keys(this.frmContact.value).forEach(key => {
        if(['facebook', 'twitter', 'linkedin', 'youtube'].includes(key)) {
          this.frmContact.get(key).setValue(this.social_link[key]);
        } else {
          this.frmContact.get(key).setValue(this.store[key]);
        }
      })

      this.frmAddress.get('physical_address').setValue(this.store.physical_address);
      this.frmAddress.get('physical_address').get('country').setValue(this.store.physical_address.country?this.store.physical_address.country._id: null);
      this.frmAddress.get('postal_address').setValue(this.store.postal_address);
      this.frmAddress.get('postal_address').get('country').setValue(this.store.postal_address.country?this.store.postal_address.country._id: null);
    })
  }

  submit_store() {
    if(this.frmStore.invalid) return;
    this.is_submitted.store = true;
    this.duplicate_error.store_name = false;
    this.duplicate_error.domain_name = false;
    const data = this.frmStore.value;   
    if(data.default_currency) {
      data.default_currency = this.getCurrency(data.default_currency);
    }    
    this.save_store(data);
  }

  submit_contact() {
    if(this.frmContact.invalid) return;
    this.is_submitted.contact = true;
    this.duplicate_error.email = false;
    const form = this.frmContact.value;   
    const data = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      social_link: {
        facebook: form.facebook,
        twitter: form.twitter,
        linkedin: form.linkedin,
        youtube: form.youtube
      }
    };
    this.save_store(data);
  }

  submit_address() {
    if(this.frmAddress.invalid) return;
    this.is_submitted.address = true;
    const data = this.frmAddress.value; 
    if(data.physical_address.country) {
      data.physical_address.country = this.getCountry(data.physical_address.country);
    }
    if(data.postal_address.country) {
      data.postal_address.country = this.getCountry(data.postal_address.country);
    }
    this.save_store(data);
  }

  async save_store(data) {
    this.store.loadData(data);
    await this.loading.create();
    this.store.save(async result => {
      await this.loading.dismiss();
      if(result.body.status == 'already_exist') {
        let fields = result.body.fields;
        for(let f of fields) {
          if(f == 'Store name') this.duplicate_error.store_name = true;
          if(f == 'Domain name') this.duplicate_error.domain_name = true;
          if(f == 'Email') this.duplicate_error.email = true;
        }        
      } else {
        this.toastService.show(Constants.message.successSaved);
      }
    }, async error => {
      await this.loading.dismiss();
      this.toastService.show(Constants.message.failedSave);
    })
  }  

  getCurrency(_id: string) {
    let index = this.currencies.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.currencies[index];
    }
    return null;
  }

  getCountry(_id:string) {
    let index = this.countries.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.countries[index];
    }
    return null;
  }

  get storeNameInput(): any {return this.frmStore.get('store_name'); }
  get storeNameInputError(): string {
    if (this.storeNameInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.duplicate_error.store_name) {return 'Already existing store name'; }
  }

  get domainNameInput(): any {return this.frmStore.get('domain_name'); }
  get domainNameInputError(): string {
    if (this.domainNameInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.duplicate_error.domain_name) {return 'Already existing domain'; }
  }

  get taxInput(): any {return this.frmStore.get('default_tax'); }
  get taxInputError(): string {
    if (this.taxInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get currencyInput(): any {return this.frmStore.get('default_currency'); }
  get currencyInputError(): string {
    if (this.currencyInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get firstNameInput(): any {return this.frmContact.get('first_name'); }
  get firstNameInputError(): string {
    if (this.firstNameInput.hasError('required')) {return Constants.message.requiredField; }    
  }
  get lastNameInput(): any {return this.frmContact.get('last_name'); }
  get lastNameInputError(): string {
    if (this.lastNameInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get emailInput(): any {return this.frmContact.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.duplicate_error.email) { return 'Already existing email'; }
  }

}
