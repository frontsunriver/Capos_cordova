import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, PopoverController } from '@ionic/angular';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ColorPicker } from 'src/app/components/color-picker/color-picker';
import { Store } from 'src/app/_classes/store.class';
import { Constants, StoreConstants } from 'src/app/_configs/constants';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { UtilService } from 'src/app/_services/util.service';
import { ToastService } from 'src/app/_services/toast.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { AlertService } from 'src/app/_services/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DbService } from 'src/app/_services/db.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  title:string = 'Ecommerce Settings';
  util = UtilFunc;
  cur_tab: string = 'general';    
  theme_color = '#' + StoreConstants.theme_color;
  store_active: boolean = false;
  frmPayment:FormGroup;
  isSubmitted = false;

  constructor(
    public store: Store,
    private nav: NavController,
    private popoverController: PopoverController,
    private utilService: UtilService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private alertService: AlertService,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private fb: FormBuilder,
    private db: DbService
  ) {
    let paypal = this.fb.group({
      active: [false],
      secret:['', [Validators.required]],
      client_id: ['', [Validators.required]],
    });
    let stripe = this.fb.group({
      active: [false],
      secret_key:['', [Validators.required]],
      public_key: ['', [Validators.required]],
    })
    this.frmPayment = this.fb.group({   
      store_pickup: [false],   
      paypal: paypal,
      stripe: stripe
    });
  }

  ngOnInit() {
    this.store.load(() => {
      if(!this.store.theme_color) {
        this.store.theme_color = StoreConstants.theme_color;        
      } else {
        this.theme_color = this.theme_color_hex;
      }
      this.store_active = this.store.active;
      Object.keys(this.frmPayment.value).forEach(key => {        
        this.frmPayment.get(key).setValue(this.store[key])
      })      
    });
  }

  public get theme_color_hex():string {
    return '#' + this.store.theme_color;
  }

  updatePlan() {
    this.nav.navigateForward(['main/setup/subscription']);
  }

  changeColor(ev:any) {
    let color = ev.target.value;
    if(this.checkValidColor(color)) {
      this.store.theme_color = color.substring(1);      
    }
  }

  checkValidColor(color:string) {    
    return (/^#[0-9A-F]{6}$/i.test(color))
  }

  async pickColor() {
    const popover = await this.popoverController.create({
      component: ColorPicker,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {color: this.theme_color_hex }
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.color) {
          this.theme_color = data.color;
          this.store.theme_color = data.color.substring(1);
        }
      }
    });

    await popover.present(); 
  }

  async selectImage(image_type:string) {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
          text: 'Load from Library',
          icon: "images",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, image_type);
          }
        },
        {
          text: 'Use Camera',
          icon: "camera",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA, image_type);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType, image_type:string) {
    var options: CameraOptions = UtilFunc.getCameraPictureOption(sourceType);

    this.camera.getPicture(options).then(imageUrl => {
      this.uploadImage(imageUrl, image_type);      
    });
  }

  async uploadImage(imageUrl: any, image_type:string) {
    // var block = imageUrl.split(";");    
    // var contentType = block[0].split(":")[1];// In this case "image/gif"
    let contentType = 'image/png';
    // get the real base64 content of the file
    // var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
    let realData = imageUrl;

    // Convert it to a blob to upload
    var blob = UtilFunc.b64toBlob(realData, contentType);

    await this.loadingService.create();
    this.utilService.uploadImage(blob, async result => {
      await this.loadingService.dismiss();
      this.store[image_type] = result.body.path;
    }, async error => {
      await this.loadingService.dismiss();
      if(error === false) {
        this.toastService.show('Please choose image file type');
      } else {
        this.toastService.show(Constants.message.failedUpload); 
      }
    })
  }

  async removeImage(path:any, image_type:string) {
    this.alertService.presentAlertConfirm('Confrim Delete', 'Are you sure to want to delete this image?', async () => {
      await this.loadingService.create();
      this.utilService.deleteFile(path, async result => {        
        await this.loadingService.dismiss();
        this.store[image_type] = '';
      }, async error => {
        await this.loadingService.dismiss();
        this.toastService.show(Constants.message.failedRemove);
      })
    })
  }

  getImagePath(path:string) {    
    return this.utilService.get_image(path);
  }

  
  public get free_plan():boolean {
    return this.store.plan.id == 'free' || !this.store.plan.id;
  }

  setActive() {        
    if(this.store_active) {
      if(!this.store.active && this.free_plan) {
        this.alertService.presentAlertConfirm('Confirm Subscriptions', 'Upgrade your plan to publish your store.', () => {
          this.updatePlan();
        }, null, 'Ok', 'Cancel');        
        this.store_active = false;
        return;
      }
    } 
    this.store.active = this.store_active;
    this.save(false);
  }

  save(show_toast:boolean=true) {     
    this.store.save(() => {
      if(show_toast) this.toastService.show(Constants.message.successSaved);
    }, error => {
      this.toastService.show(Constants.message.failedSave);
    })
  }

  savePayment(){
    this.isSubmitted = true;
    if(this.frmPayment.valid){
      const data = this.frmPayment.value;
      Object.keys(data).forEach(key => {
        this.store.paypal[key] = data[key];
      })
      this.store.save(() => {
        this.toastService.show(Constants.message.successSaved);
      }, error => {
        this.toastService.show(Constants.message.failedSave);
      })
    }
  }

  setClickCollect() {
    this.store.click_collect = !this.store.click_collect;
    this.save();
  }

  public get secretKeyInput() {return this.frmPayment.get('stripe').get('secret_key')}
  public get secretKeyInputError() {
    if(this.secretKeyInput.hasError('required')) return Constants.message.requiredField;
  }

  public get publicKeyInput() {return this.frmPayment.get('stripe').get('public_key')}
  public get publicKeyInputError() {
    if(this.publicKeyInput.hasError('required')) return Constants.message.requiredField;
  }

  public get secretInput() {return this.frmPayment.get('paypal').get('secret')}
  public get secretInputError() {
    if(this.secretInput.hasError('required')) return Constants.message.requiredField;
  }

  public get clientIdInput() {return this.frmPayment.get('paypal').get('client_id')}
  public get clientIdInputError() {
    if(this.clientIdInput.hasError('required')) return Constants.message.requiredField;
  }
}
