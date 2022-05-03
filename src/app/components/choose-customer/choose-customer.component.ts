import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Customer } from 'src/app/_classes/customer.class';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-choose-customer',
  templateUrl: './choose-customer.component.html',
  styleUrls: ['./choose-customer.component.scss'],
})
export class ChooseCustomerComponent implements OnInit {
  customers:Customer[] = [];
  customer_id:string = '';
  c_customer:any;
  is_clear:boolean = true;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private popoverController: PopoverController
  ) {
    
  }

  ngOnInit() {
    this.loadAllCustomers();
  }

  ionViewDidEnter() {
    if(this.c_customer && this.c_customer._id) {
      this.customer_id = this.c_customer._id;
    }
  }

  loadAllCustomers(): void {
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

  public get customer():Customer{
    let index = this.customers.findIndex(item => item._id == this.customer_id);
    if(index > -1) return this.customers[index];
    return null;
  }

  choose() {
    if(!this.customer) {
      this.alertService.presentAlert('Warning', 'Please choose a customer');
      return;
    }    
    this.popoverController.dismiss({process: true, customer: this.customer});
  }

  clear() {
    this.customer_id = '';
    this.popoverController.dismiss({process: true, customer: null});
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
