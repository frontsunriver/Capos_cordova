import { Injectable } from '@angular/core';
import { CountryModel } from '../_models/country-model';
import { UtilService } from './util.service';

export interface IUser{
  _id: string,
  private_web_address: string,
  first_name: string,
  last_name: string,
  password: string,
  email:string,
  phone: string,
  mobile: string,
  birthday: string,
  role: string,
  outlet: string,
  physical_address: {
    street: string,
    city: string,
    suburb: string,
    postcode: string,
    state: string,
    country: string
  },
  joined_date: string,
  commission: number,
  hour_salary: number,
  is_in_training: boolean
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  changed: boolean = false;
  user:IUser;
  countries:CountryModel[] = [];
  private details:any;

  constructor(
    private utilService: UtilService
  ) {
    this.countries = this.utilService.countries;    
    this.init();
  }

  init(details?:any) {
    this.user = {
      _id: '',
      private_web_address: '',
      first_name: '',
      last_name: '',
      password: '',
      email:'',
      phone: '',
      mobile: '',
      birthday: '',
      role: null,
      outlet: null,
      physical_address: {
        street: '',
        city: '',
        suburb: '',
        postcode: '',
        state: '',
        country: null
      },
      joined_date: '',
      commission: 0,
      hour_salary: 0,
      is_in_training: false
    }
    if(details) {
      this.details = details;
      this.loadDetails();
    } else {
      this.details = null;
    }
  }

  loadDetails() {
    if(this.details) {
      Object.keys(this.user).forEach(key => {
        if(key == 'role' && this.details.role || key == 'outlet' && this.details.outlet){
          this.user[key] = this.details[key]._id;
        } else {
          this.user[key] = this.details[key];
        }        
      }) 
    }
  }
}
