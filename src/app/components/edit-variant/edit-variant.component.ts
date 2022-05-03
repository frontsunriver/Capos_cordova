import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { IVariantProduct } from 'src/app/_classes/product.class';
import { ProductService } from 'src/app/_services/product.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { UtilService } from 'src/app/_services/util.service';
import { AlertService } from 'src/app/_services/alert.service';
import { ToastService } from 'src/app/_services/toast.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-edit-variant',
  templateUrl: './edit-variant.component.html',
  styleUrls: ['./edit-variant.component.scss'],
})
export class EditVariantComponent implements OnInit {
  title:string = 'Edit Variant';
  pair_str: string;
  form: FormGroup;
  variant_product:IVariantProduct;
  enabled: boolean = true;
  supply_price: number = 0;
  markup: number = 0;
  retail_price:number = 0;
  image: string = '';

  constructor(
    private productService: ProductService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private fb: FormBuilder,
    private camera: Camera
  ) {    
    this.form = this.fb.group({
      sku: [''],
      supplier_code: [''],      
      supply_price: [''],
      retail_price: [''],
      markup: [''],
      inventory: [''],
      reorder_point: [''],
      reorder_amount: ['']
    })
  }  
  
  public get variant_products():IVariantProduct[] {
    return this.productService.product.data.variant_products;
  }

  ngOnInit() {
    let index = this.variant_products.findIndex(item => item.pair_str == this.pair_str);
    if(index>-1) {
      this.variant_product = this.variant_products[index];
      this.title += ' ' + this.productService.getVariantProductName(this.variant_product);      
      this.enabled = this.variant_product.enabled;
      Object.keys(this.form.value).forEach(key => {
        this.form.get(key).setValue(this.variant_product[key]);
      })
      this.supply_price = this.variant_product.supply_price;
      this.markup = this.variant_product.markup;
      this.retail_price = this.variant_product.retail_price;
      this.image = this.variant_product.image;
    }
  }

  public get isTracking_inv():boolean {
    return this.productService.product.data.tracking_inv;
  }

  setPrice(element: string): void {
    this.supply_price = this.form.get('supply_price').value;
    let ctrl_markup = this.form.get('markup'), ctrl_retail_price = this.form.get('retail_price');
    this.markup = (ctrl_markup.value) ? Number(ctrl_markup.value): 0;
    this.retail_price = (ctrl_retail_price.value) ? Number(ctrl_retail_price.value): this.supply_price;
    if (element === 'supply_price' || element === 'markup') {      
      this.retail_price = this.supply_price * (1 + this.markup / 100);         
      ctrl_retail_price.setValue(UtilFunc.formatNumber(this.retail_price));   
    } else {
      if(this.supply_price > 0) {
        this.markup = 100 * (this.retail_price - this.supply_price) / this.supply_price;        
      }
      ctrl_markup.setValue(UtilFunc.formatNumber(this.markup));
    }    
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
          text: 'Load from Library',
          icon: "images",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          icon: "camera",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
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

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = UtilFunc.getCameraPictureOption(sourceType);

    this.camera.getPicture(options).then(imageUrl => {
      this.uploadImage(imageUrl);      
    });
  }

  uploadImage(imageUrl: any): void {
    // var block = imageUrl.split(";");    
    // var contentType = block[0].split(":")[1];// In this case "image/gif"
    let contentType = 'image/png';
    // get the real base64 content of the file
    // var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
    let realData = imageUrl;

    // Convert it to a blob to upload
    var blob = UtilFunc.b64toBlob(realData, contentType);

    this.utilService.uploadImage(blob, result => {
      this.image = result.body.path;
    }, error => {
      if(error === false) {
        this.toastService.show('Please choose image file type');
      } else {
        this.toastService.show(Constants.message.failedUpload); 
      }
    })
  }
  async removeImage(path:any) {
    this.alertService.presentAlertConfirm('Confrim Delete', 'Are you sure to want to delete this image?', async () => {
      await this.loadingService.create();
      this.utilService.deleteFile(path, async result => {        
        await this.loadingService.dismiss();
        this.image = null;
      }, async error => {
        await this.loadingService.dismiss();
        this.toastService.show(Constants.message.failedRemove);
      })
    })
  }

  getImagePath(path:string) {    
    return this.utilService.get_image(path);
  }

  submit() {
    this.variant_product.enabled = this.enabled;
    this.variant_product.image = this.image;    
    for(let key in this.form.value) {
      this.variant_product[key] = this.form.get(key).value;
    }
    this.popoverController.dismiss({process: true});
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
