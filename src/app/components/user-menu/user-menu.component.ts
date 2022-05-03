import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UserSwitchComponent } from '../user-switch/user-switch.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit {
  public menus = [];
  user: any;
  constructor(
    private popoverController: PopoverController,
    private nav: NavController,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    
  }

  ngOnInit() {
    if(!this.authService.isLoggedIn) {
      this.menus = [        
        {title: 'Sign in', url: '/auth/sign-in', icon: 'log-in'},
        {title: 'Sign up', url: '/auth/sign-up', icon: 'person-add'}
      ];
    } else {
      this.authService.currentUser.subscribe(user => {
        this.user = user;      
        this.menus = [          
          {title: 'Switch User', action: 'switch_user', icon: 'person'},
          {title: 'Logout', action: 'logout', icon: 'log-out'}
        ]
      });
    }
  }

  gotoUrl(url:string) {
    this.nav.navigateForward([url]);
    this.popoverController.dismiss();
  }

  doAction(item: any) {
    if(typeof item.url != 'undefined') {
      this.gotoUrl(item.url);
    } else if(typeof item.action != 'undefined') {
      if(item.action == 'logout') {      
        this.authService.logOut(() => {
          this.toastService.show('Logged out successfully');
          this.nav.navigateForward('');
        });
        this.popoverController.dismiss();
      }
      if(item.action == 'switch_user') {
        this.popoverController.dismiss();
        this.switch_user(null);
      }
    }
  }

  async switch_user(ev: any) {
    const popover = await this.popoverController.create({
      component: UserSwitchComponent,
      event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true
    });

    await popover.present();    
  }
}
