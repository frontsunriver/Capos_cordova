import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CountryModel } from 'src/app/_models/country-model';
import { Customer } from 'src/app/_classes/customer.class';
import { Constants } from 'src/app/_configs/constants';
import { ADDRESS } from 'src/app/_helpers/util.helper';
import { CustomerService } from 'src/app/_services/customer.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
})
export class EditCustomerComponent implements OnInit {
  
  title:string = 'Add New Customer';  
  isSubmitted: boolean = false;
  groups = [];
  countries:CountryModel[] = [];
  form: FormGroup;  
  duplicate_error = {
    name: false,
    email: false
  }

  constructor(
    private fb: FormBuilder,    
    private loading: LoadingService,
    private toastService: ToastService,
    private customerService: CustomerService,
    private utilService: UtilService,
    private nav: NavController
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      groupId: [''],
      email: ['', [Validators.email, Validators.required]],
      note: [''],
      code: [''],
      gender: ['Male'],
      birthday: [''],
      company: [''],
      mobile: [''],
      phone: [''],
      fax: [''],
      website: [''],
      twitter: [''],      
      physical_address: this.fb.group(ADDRESS),
      postal_address: this.fb.group(ADDRESS),
      custom_information: this.fb.group({
        field1: [''],
        field2: ['']
      })
    });

    this.utilService.get('customers/group', {}).subscribe(result => {      
      this.groups = result.body;
    });
    this.countries = this.utilService.countries;    
  }

  ngOnInit() {
    if(this.customer._id) {
      this.title = 'Edit Customer';
    }
  }

  ionViewDidEnter() {
    if(this.customer._id) {
      Object.keys(this.form.value).forEach(key => {
        if(key == 'groupId' && this.customer.data.groupId) {
          this.form.get('groupId').setValue(this.customer.data.groupId._id);
        } else {
          this.form.get(key).setValue(this.customer.data[key]);
        }        
      });
    }
  }

  public get customer():Customer {
    return this.customerService.customer;
  }

  async submit() {
    this.isSubmitted = true;
    this.duplicate_error.email = false;
    this.duplicate_error.name = false;
    if(this.form.valid) {
      const data = this.form.value;
      Object.keys(data).forEach(key => {     
        this.customer.data[key] = this.form.get(key).value;
      }) 
      await this.loading.create();
      this.customer.save( async result => {
        await this.loading.dismiss();
        if(result && result.body.status == 'already_exist') {
          let fields = result.body.fields;
          for(let f of fields) {
            this.duplicate_error[f] = true;
          }
          this.toastService.show('Please enter all fields correctly');
        } else {
          this.toastService.show(Constants.message.successSaved);
          this.customerService.changed = true;
          this.nav.navigateBack(['main/customers/customers']);        
        }
      }, async () => {
        await this.loading.dismiss();
        this.toastService.show(Constants.message.failedSave);
      })
    }
  }

  back() {
    this.nav.back();
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.duplicate_error.name) return 'Already exising name';
  }

  get groupInput(): any {return this.form.get('groupId'); }
  get groupInputError(): string {
    if (this.groupInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.emailInput.hasError('email')) {return Constants.message.validEmail; }    
    if (this.duplicate_error.email) return 'Already exising email';
  }

}
