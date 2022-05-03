import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-employee',
  templateUrl: './search-employee.component.html',
  styleUrls: ['./search-employee.component.scss'],
})
export class SearchEmployeeComponent implements OnInit {

  form: FormGroup;
  roles = [];
  outlets = [];
  filter: any;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      keyword: [''],
      role: [''],
      outlet: ['']
    });
  }

  ngOnInit() {
    this.roles = [{_id: '', name:'All Roles'}, {_id:'null', name:'Free'}];
    this.utilService.get('auth/role', {}).subscribe(result => {
      this.roles = this.roles.concat(result.body);
    }); 
    this.outlets = [{_id: '', name:'All Outlets'}];
    this.utilService.get('sell/outlet', {}).subscribe(result => {
      this.outlets = this.outlets.concat(result.body);
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
      role: '',
      outlet: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
