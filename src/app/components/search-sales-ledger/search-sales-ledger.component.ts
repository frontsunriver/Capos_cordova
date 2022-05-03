import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilService } from 'src/app/_services/util.service';
import { Constants } from 'src/app/_configs/constants';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-search-sales-ledger',
  templateUrl: './search-sales-ledger.component.html',
  styleUrls: ['./search-sales-ledger.component.scss'],
})
export class SearchSalesLedgerComponent implements OnInit {
  form: FormGroup;
  users:any[] = [];
  customers:any[] = [];
  statuses = [];
  filter: any;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      customer: [''],
      sale_status: ['all_payments'],
      user_id: [''],
      start:[''],
      end:['']
    });
  }

  ngOnInit() {
    this.utilService.get('customers/customer').subscribe(result => {
      this.customers = result.body;
    });

    this.utilService.get('auth/users').subscribe(result => {
      this.users = result.body;
    });

    this.statuses.push({value: 'all_payments', label: 'All Sales'});
    for(let s of Constants.sale_status) {
      if(Constants.paid_status.includes(s.value)) this.statuses.push(s);
    }
  }

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
      customer: '',
      sale_status: 'all_payments',
      user_id: '',
      start:'',
      end:''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
