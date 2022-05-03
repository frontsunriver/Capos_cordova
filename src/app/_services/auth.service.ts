import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS, Constants } from '../_configs/constants';
import { User } from '../_classes/customer.class';
import { NavController } from '@ionic/angular';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public ipAddress = new BehaviorSubject('');
  public currentUser: BehaviorSubject<User>;
  public main_menu = [];

  constructor(
    public jwtHelper: JwtHelperService,
    private nav: NavController,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.currentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.getIpAddress();
    this.getMainMenu();
  }

  setToken(token:string): any {
    localStorage.setItem('token', token);
  }

  public get getCurrentUser(): User {
    return this.currentUser.value;
  }

  getToken(): any {
    return localStorage.getItem('token');
  }

  getUrl(uri: string): string {
    return APP_CONSTANTS.API_URL + uri;
  }

  getIpAddress(): any {
    this.http.get('https://jsonip.com').subscribe((res: any) => {
      this.ipAddress.next(res.ip);
    });
  }

  signUp(user: any): any {
    return this.http.post(this.getUrl('auth/register'), user);
  }

  signIn(user:any): any {
    console.log(this.getUrl('auth/login'))
    return this.http.post(this.getUrl('auth/login'), user).pipe(map(
      (result: any) => {
        if(!result.error && result.token) {
          const decoded = this.jwtHelper.decodeToken(result.token);          
          this.setCurrentUser(decoded);
          this.setToken(result.token);
          this.getMainMenu();
          return {error: 0, token:decoded};
        } else {
          return result;
        }
      }
    ));
  }

  forgotPassword(user:any): any {    
    return this.http.post(this.getUrl('auth/forgot_password'), user);
  }

  setCurrentUser(user:any): void {
    this.currentUser.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return (token !== 'undefined' && token !== null && !this.jwtHelper.isTokenExpired());
  }

  logOut(callback?:Function): void {
    let user = this.getCurrentUser;
    const data = {
      user_id: user._id,
      end_date: new Date().toISOString()
    };
    this.http.put(this.getUrl('auth/timesheet'), data).subscribe(result => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.getMainMenu();
      if(callback) callback();
    });
  }

  checkPremission(page:string) {
    let page_permissions = {
      'sell' : ['make_sales', 'perform_sale'],
      'close_register' : ['close_registers'],
      'sales_history' : ['make_sales'],
      'quoted' : ['make_sales'],
      'cash_management' : ['perform_cash'],
      'sales_ledger' : ['perform_sale', 'void_sales', 'issue_store_credit'],
      'sales_report' : ['view_sales'],
      'payment_report' : ['view_reporting'],
      'regiser_closure' : ['view_sales', 'close_registers'],
      'manage_order': ['perform_supplier', 'perform_stock', 'perform_inventory'],
      'setup_general' : ['manage_keys']
    }
    let user = this.getCurrentUser;    
    let f:boolean = true;
    if(user.role) {
      for(let p of page_permissions[page]) {
        if(!user.role.permissions.includes(p)) {
          f = false;
          break;
        }
      }
    } else {
      f = false;
    }
    
    if(!f) {
      this.toastService.show('You have no permission for this page');
      this.nav.navigateForward(['/dashboard/home']);
    }
  }

  getMainMenu() {
    if(!this.isLoggedIn) {
      this.main_menu =  [
        { label: 'Home', link: '/static/home', icon: 'home' },
        { label: 'Features', link: '/static/features', icon: 'bulb' },
        { label: 'How It Works', link: '/static/how_it_works', icon: 'paper-plane' },
        { label: 'Support', link: '/static/support', icon: 'checkmark-done' },
        { label: 'Pricing', link: '/static/pricing', icon: 'diamond' },
        { label: 'Faq', link: '/static/faq', icon: 'help' },
        { label: 'Blog', link: '/static/blog', icon: 'bookmarks' },
        { label: 'Contact', link: '/static/contact', icon: 'call' },
      ];
    } else {
      this.main_menu = Constants.dashboardItems;
    }
  }
}
