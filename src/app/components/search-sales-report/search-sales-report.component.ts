import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-search-sales-report',
  templateUrl: './search-sales-report.component.html',
  styleUrls: ['./search-sales-report.component.scss'],
})
export class SearchSalesReportComponent implements OnInit {
  
  form: FormGroup;  
  filter: any;

  constructor(
    private fb: FormBuilder,    
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      start:[''],
      end:['']
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
      start:'',
      end:''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
