import { Component, OnInit } from '@angular/core';
import { Store } from 'src/app/_classes/store.class';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage implements OnInit {
  title:string = 'Preferences';
  original = {
    messagebox: false,
    confirm_delete_product: false,
    confirm_discard_sale: false,
    confirm_pay: false
  }
  loaded: boolean = false;
  constructor(
    public store: Store,
    private toastService: ToastService,
    private loading: LoadingService
  ) { }

  ngOnInit() {
    this.store.load(() => {
      this.changeOriginal();      
    });
  }

  async save() {   
    if(!this.isChanged) return;
    await this.loading.create();
    this.store.save(async result => {
      await this.loading.dismiss();
      this.toastService.show(Constants.message.successSaved);
      this.changeOriginal();
    },async error => {
      await this.loading.dismiss();
      this.toastService.show(Constants.message.failedSave);
    });      
  }

  get isChanged():boolean {
    if(this.store._id && this.loaded) {      
      for(let key in this.original) {
        if(this.original[key] != this.store.preferences[key]) {
          return true;
        }
      }
    }
    return false;
  }

  changeOriginal() {
    for(let key in this.original) {
      this.original[key] = this.store.preferences[key];
    }
    this.loaded = true;    
  }

  getStatusString(){
    if(this.store.preferences.messagebox){
      return 'On';
    }
    else{
      return 'Off';
    }
  }

}
