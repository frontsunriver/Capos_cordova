import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-search-inventory-report',
  templateUrl: './search-inventory-report.component.html',
  styleUrls: ['./search-inventory-report.component.scss'],
})
export class SearchInventoryReportComponent implements OnInit {
  
  form: FormGroup;  
  filter: any;

  constructor(
    private fb: FormBuilder,    
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      product:['']
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
      product:''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
