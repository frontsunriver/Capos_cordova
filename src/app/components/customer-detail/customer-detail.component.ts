import { Component, OnInit, Input } from '@angular/core';
import { Customer } from 'src/app/_classes/customer.class';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent implements OnInit {

  @Input('customer') customer:Customer;
  
  constructor() { }

  ngOnInit() {}

}
