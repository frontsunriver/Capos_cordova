import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-sale',
  templateUrl: './search-sale.component.html',
  styleUrls: ['./search-sale.component.scss'],
})
export class SearchSaleComponent implements OnInit {
  form: FormGroup;
  users = [];
  customers = [];
  statuses = [];
  outlets = [];

  filter: any;
  default_sale_status:string = '';

  constructor(
    private utilService: UtilService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      sale_number: [''],
      customer: [''],
      sale_status: [''],
      outlet: [''],
      user_id: [''],
      note:[''],
      start:[''],
      end:['']
    });
  }

  ngOnInit() {    
    this.utilService.get('customers/customer').subscribe(result => {
      this.customers = result.body;
    });

    this.utilService.get('sell/outlet').subscribe(result => {
      this.outlets = result.body;
    });

    this.utilService.get('auth/users').subscribe(result => {
      this.users = result.body;
    });
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
      sale_number: '',
      customer: '',
      sale_status: this.default_sale_status,
      user_id: '',
      outlet: '',
      note: '',
      start:'',
      end:''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
