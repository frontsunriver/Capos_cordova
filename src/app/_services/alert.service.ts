import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alert: any = null;
  constructor(private alertController: AlertController) { }

  async presentAlertConfirm(title:string, msg:string, okHandler?:Function, cancelHandler?:Function, ok_button?:string, cancel_button?:string) {
    if(this.alert) return;
    if(!ok_button) ok_button = 'Yes';
    if(!cancel_button) cancel_button = 'No';
    this.alert = await this.alertController.create({
      cssClass: 'custom-alert-class',
      header: title,
      message: msg,
      buttons: [
        {
          text: cancel_button,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            if(cancelHandler) cancelHandler();
            this.alert = null;
          }
        }, {
          text: ok_button,
          handler: () => {
            if(okHandler) okHandler();
            this.alert = null;
          }
        }
      ]
    });

    await this.alert.present();
  }

  async presentConfirmDelete(item: string, okHandler?:Function, cancelHandler?:Function) {
    await this.presentAlertConfirm('Remove ' + item, 'Do you really want to remove this ' + item + ' ?', okHandler, cancelHandler);
  }

  async presentAlert(title:string, msg:string) {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert-class',
      header: title,      
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
