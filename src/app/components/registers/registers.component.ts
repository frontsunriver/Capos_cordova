import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { EditRegisterComponent } from '../edit-register/edit-register.component';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.scss'],
})
export class RegistersComponent implements OnInit {
  @Input('registers') registers:any[];
  @Input('outlet_id') outlet_id:string;
  @Output() reloadEvent = new EventEmitter();
  user: any;

  constructor(
    private popoverController: PopoverController,
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private loading: LoadingService,
    private toastService: ToastService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    })
  }

  ngOnInit() {}

  addNew() {
    let register = {
      _id: '',
      name: '',
      outlet: this.outlet_id,
      private_web_address: this.user.private_web_address
    }
    this.openForm(register);
  }

  edit(register: any) {
    this.openForm(register);
  }

  async openForm(register) {
    const popover = await this.popoverController.create({
      component: EditRegisterComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps:{register: register}
    });

    popover.onDidDismiss().then(result => {
      if(result && result.data) {
        if(result.data.process) {
          this.onReloadList();
        }
      }
    })

    await popover.present();    
  }

  async delete(register:any, index: number) {
    if(index == 0) {
      this.toastService.show('Outlet has to have at least a register.');
      return;
    }
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this register?', async () => {
      await this.loading.create();
      this.utilService.delete('sell/register?_id=' + register._id).subscribe(async result => {
        await this.loading.dismiss();
        this.onReloadList();
      })
    })
  }

  onReloadList() {
    this.reloadEvent.emit();
  }

}
