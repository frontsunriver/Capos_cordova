import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loadingElement:any = null;

  constructor(private loadingController: LoadingController) { }

  async create() {
    if(this.loadingElement) this.dismiss();
    this.loadingElement = await this.loadingController.create({
      message: 'Please wait...',
      spinner: 'crescent'
    });
    return await this.loadingElement.present();    
  }

  async dismiss() {    
    if(this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }
}
