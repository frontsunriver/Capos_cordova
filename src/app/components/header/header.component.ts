import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input('title') title:string;
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  async userPopover(ev: any) {    
    const popover = await this.popoverController.create({
      component: UserMenuComponent,
      event: ev,
      cssClass: 'popover_setting',
      // componentProps: {
      //   site: siteInfo
      // },
      translucent: true
    });

    popover.onDidDismiss().then((result) => {
      //console.log(result.data);
    });

    return await popover.present();
  }

}
