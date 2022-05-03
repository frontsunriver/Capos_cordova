import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-cash',
  templateUrl: './search-cash.component.html',
  styleUrls: ['./search-cash.component.scss'],
})
export class SearchCashComponent implements OnInit {
  form: FormGroup;
  users:any[] = [];
  filter: any;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      user_id: [''],
      is_credit: [''],
      start:[''],
      end:['']
    });
  }

  ngOnInit() {
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
      user_id: '',
      is_credit: '',
      start:'',
      end:''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
