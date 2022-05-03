import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-search-order-stock',
  templateUrl: './search-order-stock.component.html',
  styleUrls: ['./search-order-stock.component.scss'],
})
export class SearchOrderStockComponent implements OnInit {
  orderTypes = ['purchase', 'return', 'receive'];
  suppliers = [];
  outlets = [];
  form: FormGroup;  
  filter: any;
  util = UtilFunc;

  constructor(
    private utilService: UtilService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      keyword: [''],
      type: [''],
      outlet: [''],
      supplier: [''],
      date_from: [''],
      date_to: [''],
      due_from: [''],
      due_to: ['']
    });

    this.utilService.get('product/supplier', {}).subscribe(result => {
      this.suppliers = result.body;
    });
    this.utilService.get('sell/outlet', {}).subscribe(result => {
      this.outlets = result.body;
    });
  }

  ngOnInit() {
    
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
      keyword: '',
      type: '',
      outlet: '',
      supplier: '',
      date_from: '',
      date_to: '',
      due_from: '',
      due_to: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
