import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Store } from 'src/app/_classes/store.class';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { ADDRESS } from "src/app/_helpers/util.helper";
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { NavController } from '@ionic/angular';
import { CountryModel } from 'src/app/_models/country-model';

@Component({
  selector: 'app-edit-outlet',
  templateUrl: './edit-outlet.page.html',
  styleUrls: ['./edit-outlet.page.scss'],  
})
export class EditOutletPage implements OnInit {
  title = 'Add New Outlet';
  cur_tab: string = 'store';
  form: FormGroup;
  duplicate_error:boolean = false;
  is_submitted:boolean = false;  
  countries:CountryModel[] = [];
  taxList = [];
  user: any;
  _id: string = '';
  is_main: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,    
    private utilService: UtilService,
    private authService: AuthService,
    private toastService: ToastService,
    public store: Store,
    private loading: LoadingService,
    private nav: NavController
  ) {
    this.form = this.fb.group({
      name:['', [Validators.required]],
      defaultTax:['', [Validators.required]],
      physical_address: this.fb.group(ADDRESS),           
      email:['', [Validators.required, Validators.email]],
      phone:[''],
      twitter:['']
    });
  }

  ngOnInit() {
    this.utilService.reload_outlets = false;

    this.activateRoute.queryParams.subscribe(query => {
      if (query && query._id) {
        this._id = query._id;
        this.title = 'Edit Outlet';        
        this.loadOutlet();
      }
    });    

    this.authService.currentUser.subscribe(user => {
      this.user = user;      
      this.utilService.get('sale/salestax', {user_id: this.user._id, store_name: this.user.store_name}).subscribe(result => {
        this.taxList = result.body;            
      });      
    });    
    this.countries = this.utilService.countries;       
  }

  async loadOutlet() {
    await this.loading.create();
    this.utilService.get('sell/outlet', {_id: this._id}).subscribe(async result => {          
      await this.loading.dismiss();
      const outlet = result.body;          
      this.is_main = outlet.is_main;
      Object.keys(this.form.value).forEach(key => {            
        this.form.get(key).setValue(outlet[key]);
      })        
    }, async error => {
      await this.loading.dismiss();
      this.toastService.show('No existing outlet');
      this.nav.navigateBack(['main/setup/outlets']);
    })
  }

  async submit() {
    if(this.form.invalid) return;
    this.is_submitted = true;
    this.duplicate_error = false;
    const data = this.form.value;
    data.private_web_address = this.user.private_web_address;
    data.is_main = this.is_main;    
    await this.loading.create();
    if(!this._id) {
      this.utilService.post('sell/outlet', data).subscribe(async result => {  
        await this.save(result);
      }, async error => {
        await this.loading.dismiss();
        this.toastService.show(Constants.message.failedSave);
      });
    } else {
      data._id = this._id;        
      this.utilService.put('sell/outlet', data).subscribe(async result => {                    
        await this.save(result);
      }, async error => {
        this.toastService.show(Constants.message.failedSave);
      });
    }
  }

  async save(result) {    
    await this.loading.dismiss();
    if(result.body.status == 'already_exist') {
      this.duplicate_error = true;      
    } else {
      this.utilService.reload_outlets = true;
      this.nav.navigateBack(['main/setup/outlets']);
      this.toastService.show(Constants.message.successSaved);
    }
  }  

  getCountry(_id:string) {
    let index = this.countries.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.countries[index];
    }
    return null;
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.duplicate_error) {return 'Already existing outlet'; }
  }

  get taxInput(): any {return this.form.get('defaultTax'); }
  get taxInputError(): string {
    if (this.taxInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
  }
}
