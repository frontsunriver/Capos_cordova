import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-search-online-order',
  templateUrl: './search-online-order.component.html',
  styleUrls: ['./search-online-order.component.scss'],
})
export class SearchOnlineOrderComponent implements OnInit {
  
  order_status = Constants.order_status;
  payment_status = Constants.payment_status;
  form: FormGroup;  
  filter: any;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      keyword: [''],
      customer: [''],
      status: [''],
      payment_status: [''],
      start: [''],
      end: ['']
    });
  }

  ngOnInit() {}

  ionViewDidEnter() {
    if(this.filter) {
      Object.keys(this.form.value).forEach(key => {
        this.form.get(key).setValue(this.filter[key]);
      })
    }
  }

  search() {    
    this.popoverController.dismiss({
      process: true, filter: this.form.value
    });
  }

  clearFilter() {
    this.form.setValue({
      keyword: '',
      customer: '',
      status: '',
      payment_status: '',
      start: '',
      end: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
