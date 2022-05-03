import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-register-closure',
  templateUrl: './search-register-closure.component.html',
  styleUrls: ['./search-register-closure.component.scss'],
})
export class SearchRegisterClosureComponent implements OnInit {
  form: FormGroup;
  user: any;
  registers = [];
  filter: any;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      register:[''],
      start: [''],
      end: ['']
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {        
      this.user = user; 
      const filter = this.user.outlet ? {outlet: this.user.outlet._id} : {};
      this.utilService.get('sell/register', filter).subscribe(result => {
        this.registers = result.body;
      });
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
      register: '',
      start: '',
      end: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
