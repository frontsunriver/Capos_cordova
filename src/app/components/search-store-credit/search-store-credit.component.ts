import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-store-credit',
  templateUrl: './search-store-credit.component.html',
  styleUrls: ['./search-store-credit.component.scss'],
})
export class SearchStoreCreditComponent implements OnInit {
  form: FormGroup;
  customers:any[] = [];
  filter: any;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      customer: [''],      
    });
  }

  ngOnInit() {
    this.utilService.get('customers/customer').subscribe(result => {
      this.customers = result.body;
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
      customer: ''      
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
