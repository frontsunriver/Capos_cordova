import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-price-book',
  templateUrl: './search-price-book.component.html',
  styleUrls: ['./search-price-book.component.scss'],
})
export class SearchPriceBookComponent implements OnInit {

  form: FormGroup;
  groups = [];
  outlets = [];
  filter: any;

  constructor(
    private utilService: UtilService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name:[''],
      group: [''],
      outlet: [''],
      start: [''],
      end: ['']
    });
  }

  ngOnInit() {
    this.utilService.get('customers/group', {mode: 'customer'}).subscribe(result => {
      this.groups = result.body;      
    });

    this.utilService.get('sell/outlet', {}).subscribe(result => {
      this.outlets = result.body;      
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
      name: '',
      group: '',
      outlet: '',
      start: '',
      end: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
