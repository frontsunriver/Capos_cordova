import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Customer } from 'src/app/_classes/customer.class';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-unfulfilled-sale',
  templateUrl: './unfulfilled-sale.component.html',
  styleUrls: ['./unfulfilled-sale.component.scss'],
})
export class UnfulfilledSaleComponent implements OnInit {
  form: FormGroup;
  step:number = 0;
  titles:string[] = ['Choose how this order will be fulfilled.', 'Contact info for the delivery.', 'Add shipping details for this sale.'];
  descriptions:string[] = ['Inventory will be reserved for all items in the sale.', 'Enter details to contact the customer about this order.',
                      'Record the delivery address in the sale note.'];
  fulfillment = {
    mode: 'delivery',
    customer: null,
    email: '',
    phone: '',
    mobile: '',
    fax: ''
  };
  note:string = '';
  isSubmitted: boolean = false;
  contact_number_mode:String = 'mobile';
  customers:Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController,
    private authService: AuthService,
    private utilService: UtilService
  ) {
    this.form = this.fb.group({
      email:['', [Validators.email]]     
    });  

    this.utilService.get('customers/customer').subscribe(result => {
      if(result && result.body) {
        for(let c of result.body){          
          const customer = new Customer(this.authService, this.utilService);          
          customer.loadDetails(c);
          this.customers.push(customer);
        }
      }
    });
  }

  ngOnInit() {    
  }

  
  gotoStep2(){    
    this.isSubmitted = true;
    if(this.form.valid) {
      this.step = 2;
    }
  }

  doAction() {
    this.fulfillment.email = this.form.get('email').value;
    const data = {
      process: true,
      fulfillment: this.fulfillment      
    };    
    this.popoverController.dismiss(data);    
  }

  selCustomer() {
    if(!this.fulfillment.customer) {
      return;
    }
    this.form.get('email').setValue(this.fulfillment.customer.data.email);
    this.fulfillment.mobile = this.fulfillment.customer.data.mobile;
    this.fulfillment.phone = this.fulfillment.customer.data.phone;
    this.fulfillment.fax = this.fulfillment.customer.data.fax;
    this.contact_number_mode = 'mobile';
  }

  getContactInfo() {
    let result = '';
    if(this.fulfillment.customer) {
      if(this.fulfillment.customer.data.mobile) {
        result = this.fulfillment.customer.data.mobile;
      } else if(this.fulfillment.customer.data.phone) {
        result = this.fulfillment.customer.data.phone;
      } else if(this.fulfillment.customer.data.fax) {
        result = this.fulfillment.customer.data.fax;
      }
    }
    return result;
  }

  resetCustomer() {
    this.fulfillment.customer = null;
    this.form.get('email').setValue('');
    this.fulfillment.mobile = '';
    this.fulfillment.phone = '';
    this.fulfillment.fax = '';
  }

  checkContact() {
    let email = this.form.get('email').value;
    return email || this.fulfillment.mobile || this.fulfillment.phone || this.fulfillment.fax;
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {    
    if (this.emailInput.hasError('email')) {return Constants.message.validEmail; }    
  }

}
