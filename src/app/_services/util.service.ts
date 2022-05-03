import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { APP_CONSTANTS } from '../_configs/constants';
import { DbService } from './db.service';
import { CountryModel } from '../_models/country-model';
import { CurrencyModel } from '../_models/currency-model';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  public reload_sel_products: boolean = false;
  public reload_outlets:boolean = false; 
  public isOnline: boolean = true;
  public is_downloaded: boolean = true;
  public is_uploaded: boolean = true;
  public countries:CountryModel[] = [];
  public currencies:CurrencyModel[] = [];

  constructor(
    private http: HttpClient,
    private dbService: DbService
  ) {
    this.getCountries();
    this.getCurrencies();
  }

  getCurrentPrivateWebAddress() {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      return user.private_web_address;
    }
    return null;
  }

  getUrl(uri:string): string {
    return APP_CONSTANTS.API_URL + uri;
  }

  post(uri:string, data:any): any {
    return this.http.post<any>(this.getUrl(uri), data, {observe: 'response'});
  }

  get(uri:string, data:any = {}): any {
    let httpParams = new HttpParams();
    Object.keys(data).forEach(key => {
      httpParams = httpParams.append(key, data[key]);
    });    

    if(!data.private_web_address) {
      let private_web_address = this.getCurrentPrivateWebAddress();      
      if(private_web_address) {
        httpParams = httpParams.append('private_web_address', private_web_address);        
      } 
    }
    return this.http.get<any>(this.getUrl(uri), {params: httpParams, observe: 'response'});
  }

  put(uri:string, data:any): any {
    return this.http.put(this.getUrl(uri), data, {observe: 'response'});
  }

  delete(uri:string): any {
    return this.http.delete(this.getUrl(uri), {observe: 'response'});
  }

  getCountries() {
    if(this.isOnline) {
      this.get('auth/country', {}).subscribe(result => {
        for(let c of result.body) {
          this.countries.push({
            _id: c._id,
            country_code: c.country_code,
            country_name: c.country_name,
            currency_code: c.currency_code,
            iso_numeric: c.iso_numeric,
            capital: c.capital,
            continent_name: c.continent_name,
            continent: c.continent,
            languages: c.languages,
            geo_name_id: c.geo_name_id
          })
        }        
      });
    } else {
      this.dbService.dbState().subscribe(result => {
        if(result) {
          this.dbService.getCountries(countries => {
            this.countries = countries;
          })
        }
      })
    }
  }

  getCurrencies() {
    if(this.isOnline) {
      this.get('util/currencies', {}).subscribe(result => {           
        for(let c of result.body) {
          this.currencies.push({
            _id: c._id,
            symbol: c.symbol,
            name: c.name,
            symbol_native: c.symbol_native,
            decimal_digits: c.decimal_digits,
            rounding: c.rounding,
            code: c.code,
            name_plural: c.name_plural
          })
        }
      }); 
    } else {
      this.dbService.dbState().subscribe(result => {
        if(result) {
          this.dbService.getCountries(currencies => {
            this.currencies = currencies;
          })
        }
      })
    }
  }

  uploadImage(file: any, success?:Function, error?:Function): void {       
    const formData = new FormData();
    formData.append('file', file);
    this.post('util/file', formData).subscribe(result => {      
      if(success) success(result);
    }, err => {
      if(error) error(err);
    });
  }

  uploadFile(files: any, success?:Function, error?:Function): void {
    const file = files[0];
    if (!file.type.includes('image')) {
      if(error) error(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.post('util/file', formData).subscribe(result => {      
      if(success) success(result);
    }, err => {
      if(error) error(err);
    });
  }

  uploadFiles(files: any, success?:Function, error?:Function): void {    
    let f = false;
    const formData = new FormData();
    for(let i=0;i<files.length;i++) {
      const file = files[i];
      if(file.type.includes('image')) {
        f = true;
        formData.append('file', file);
      }
    }
    if(f) {      
      this.post('util/files', formData).subscribe(result => {        
        if(success) success(result);
      }, err => {
        if(error) error(err);
      });
    } else {
      if(error) error(false);
    }
  }

  deleteFile(path:any, success?:Function, error?:Function) {
    this.put('util/file', {path: path}).subscribe(result => {
      if(success) success(result)
    }, err => {
      if(error) error();
    })
  }

  get_image(path:string) {
    return APP_CONSTANTS.SERVER_URL + path;
  }


}
