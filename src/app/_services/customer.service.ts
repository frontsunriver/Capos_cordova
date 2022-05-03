import { Injectable } from '@angular/core';
import { Customer } from '../_classes/customer.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  customer: Customer;
  changed: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) {
    this.init();
  }

  init(details?:any) {
    this.customer = new Customer(this.authService, this.utilService);
    if(details) {
      this.customer.loadDetails(details);
    }
  }

}
