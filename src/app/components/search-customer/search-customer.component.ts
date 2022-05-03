import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-customer',
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.scss'],
})
export class SearchCustomerComponent implements OnInit {

  form: FormGroup;
  groups:any[] = [];
  filter: any;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      keyword: [''],
      group: ['']
    });
  }

  ngOnInit() {
    const dataGroup = {mode:'customer'};
    this.utilService.get('customers/group', dataGroup).subscribe(result => {      
      this.groups = this.groups.concat(result.body);
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
      keyword: '',
      group: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
