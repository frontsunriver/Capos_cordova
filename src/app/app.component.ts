import { Component } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { DbService } from './_services/db.service';
import { UtilService } from './_services/util.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  appPages = [];  
  cur_item: string = '';
  login_status: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,    
  ) {    
    this.utilService.isOnline = navigator.onLine;    
    this.appPages = this.authService.main_menu;
    
    window.addEventListener('offline', () => {
      //Do task when no internet connection
      console.log('offline');
      this.utilService.isOnline = false;
    });
    window.addEventListener('online', () => {
      //Do task when internet connection returns
      console.log('online');
      this.utilService.isOnline = true;
    });
  }

  get isLoggedIn():boolean {
    if(this.login_status != this.authService.isLoggedIn) {
      this.login_status = this.authService.isLoggedIn;
      this.getMenu();
    }
    return this.authService.isLoggedIn;
  }

  getMenu() {
    this.appPages = this.authService.main_menu;    
  }
}
