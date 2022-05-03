import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController, PopoverController } from '@ionic/angular';
import { IVariantProduct, Product } from 'src/app/_classes/product.class';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { IVariant, ProductService } from 'src/app/_services/product.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { NewItemComponent } from '../new-item/new-item.component';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AlertService } from 'src/app/_services/alert.service';
import { EditVariantComponent } from '../edit-variant/edit-variant.component';
import { EditAttributeValuesComponent } from '../edit-attribute-values/edit-attribute-values.component';
import { LoadingService } from 'src/app/_services/loading.service';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditProductComponent implements OnInit {
  title:string = 'Add New Product';
  util = UtilFunc;
  form:FormGroup;  
  ctrl_values = {
    tag: [], type: [], brand: [], supplier: [], attribute: [], tax: [], outlet: []
  }  
  permission = {
    brand: false, supplier: false, type: false
  };
  user:any;  
  supply_price = 0;
  retail_price = 0;
  markup = 0;     
  tags = []; 
  all_tags = [];
  images = [];

  loading: boolean = false;
  rows:any[];  
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: false, checked: true},
    {prop: 'supply_price', name: 'Supply Price', sortable: false, checked: true},
    {prop: 'markup', name: 'Markup', sortable: false, checked: true},
    {prop: 'retail_price', name: 'Retail Price', sortable: false, checked: true},
    {prop: 'enabled', name: 'Active', sortable: false, checked: true},
    {prop: 'inventory', name: 'Inventory', sortable: false, checked: true},
    {prop: 'reorder_point', name: 'Reorder Point', sortable: false, checked: true},
    {prop: 'reorder_amount', name: 'Reorder Amount', sortable: false, checked: true},
    {prop: 'image', name: 'Image', sortable: false, checked: true},    
    {prop: 'sku', name: 'SKU', sortable: false, checked: true},
    {prop: 'supplier_code', name: 'Supplier Code', sortable: false, checked: true},
  ];
  columns:any[];
  show_columns:any[] = [2, 3, 5, 8];
  isSubmitted:boolean = false;  

  constructor(
    private fb:FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private utilService: UtilService,
    private toastService: ToastService,
    private popoverController: PopoverController,
    private nav: NavController,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private actionSheetController: ActionSheetController,
    private camera: Camera
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission.brand = this.user.role.permissions.includes('create_brand');
        this.permission.type = this.user.role.permissions.includes('create_product_type');
        this.permission.supplier = this.user.role.permissions.includes('create_supplier');
      }
    });

    this.form = this.fb.group({
      name: ['', [Validators.required]],
      handle: ['', [Validators.required]],
      description: [''],      
      type: ['', [Validators.required]],
      brand: ['', [Validators.required]],   
      sku: [''],
      supplier: ['', [Validators.required]],
      barcode: ['', [Validators.required]],
      supplier_code: ['', [Validators.required]],
      supply_price: ['', [Validators.required]],
      inventory: [''],
      reorder_point: [''],
      reorder_amount: [''],
      outlet: [''],
      tax: [''],
      markup: [''],
      retail_price: ['']
    });
  }

  ngOnInit() {        
    Object.keys(this.ctrl_values).forEach(key => {
      let url = 'product/' + key;
      if(key == 'tax') url = 'sale/salestax';
      if(key == 'outlet') url = 'sell/outlet';
      this.utilService.get(url, {}).subscribe(result => {
        this.ctrl_values[key] = result.body;
        if(key == 'tag') {
          for(let t of result.body) {
            this.all_tags.push({
              display: t.name, value: t.name
            })
          }
        }
      });
    }) 
    this.getVariantColumns();
  }

  ionViewDidEnter() {
    this.loadData();
  }
  
  public get product():Product {
    return this.productService.product;
  }

  public get variants():IVariant[] {
    return this.productService.variants;
  }

  public get variant_products():IVariantProduct[] {
    return this.productService.product.data.variant_products;
  }

  loadData() {
    if(this.product._id) {      
      this.title = 'Edit Product';
      Object.keys(this.form.value).forEach(key => {
        if(['type', 'brand', 'tax', 'supplier'].includes(key)) {
          this.form.get(key).setValue(this.product.data[key]._id);
        } else {
          this.form.get(key).setValue(this.product.data[key]);
        }        
      }) 
      this.supply_price = this.product.data.supply_price;
      this.markup = this.product.data.markup;
      this.retail_price = this.product.data.retail_price;    
      this.productService.loadVariants();
      this.tags = this.productService.tags;
      this.images = this.product.data.images;
      this.getVariantRowData(); 
    }
  }

  getNewBarcode(callback?:Function) {
    this.utilService.get('product/new_barcode', {}).subscribe(result => {
      if(result && result.body) {
        this.form.get('barcode').setValue(result.body.barcode);
        if(callback) callback();
      }
    }, error => {
      this.toastService.show('Failed to generate. Try again later.');
    })
  }

  onChangeName() {
    let s = this.nameInput.value;
    this.handleInput.setValue(this.util.getSlug(s));
  }

  addItem(item:string): void {    
    let ctrl = this.form.get(item);    
    if(ctrl.value == 'addNew') {
      ctrl.setValue('');
      this.handleAddItem(item, 'product/' + item, data => {
        this.ctrl_values[item].push(data);
        ctrl.setValue(data._id);
      })
    }
  }  

  newVariant(): void {    
    this.variants.push({attribute: '', value: []});
    this.productService.getOldVariants();
  }

  async editAttributeValues() {
    const popover = await this.popoverController.create({
      component: EditAttributeValuesComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {attributes: this.ctrl_values.attribute}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process) {
          this.getVariantRowData();
        }
      }
    });

    await popover.present();
  }

  removeVariant(attrIndex): void {
    let values = this.variants[attrIndex].value.length;
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this variant?', () => {
      this.variants.splice(attrIndex, 1);
      if(values>0) this.genVariantProducts(attrIndex, -1, 'remove');
      this.productService.getOldVariants();
    })
  }

  addAttribute(attrIndex: number): void {
    if (this.variants[attrIndex].attribute === 'addNew') {
      this.variants[attrIndex].attribute = '';
      let item = 'attribute';
      this.handleAddItem(item, 'product/' + item, (data) => {        
        this.ctrl_values[item].push(data);
        this.variants[attrIndex].attribute = data._id;
      })
    }     
    this.productService.getOldVariants();
  }

  checkSelected(id: string) {
    for(let i=0; i<this.variants.length;i++) {
      if(this.variants[i].attribute == id) {
        return true;
      }
    }
    return false;
  }

  addAttrValue(event:any, attrIndex:number) {
    const value = event.value.trim();    
    if (value) {      
      this.genVariantProducts(attrIndex, this.variants[attrIndex].value.length-1, 'add');
      this.productService.getOldVariants();
    }        
  }

  removeAttrValue(event:any, attrIndex:number) {
    const value = event.value;
    const index = this.productService.getIndexOfValue(attrIndex, value);
    if (index !== -1) {
      this.genVariantProducts(attrIndex, index, 'remove');
    }
    this.productService.getOldVariants();
  }  

  async handleAddItem(item_name: string, url: string, callback:Function) {
    const popover = await this.popoverController.create({
      component: NewItemComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {item_name: item_name, url: url, user: this.user}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.result) {
          callback(data.result);
        }
      }
    });

    await popover.present();
  }

  genVariantProducts(a_index:number, v_index:number, mode:string): void {    
    const variants = this.variants.filter(variant => variant.attribute && variant.value.length);
    const varLen = variants.length;        
    if(mode == 'add') {
      for(let i=0;i<this.variant_products.length;i++) {
        let pair = this.variant_products[i].pair;
        if(pair.length-1 < a_index) {
          this.variant_products[i].pair.push(v_index);
          this.variant_products[i].pair_str = this.getPairString(this.variant_products[i].pair);
        }
      }
      if (varLen > 0) {
        for(let i=0;i<variants[0].value.length;i++) {
          if(varLen == 1) {
            this.pushVariantProduct([i]);
          } else {
            for(let j=0;j<variants[1].value.length;j++) {
              if(varLen == 2) {
                this.pushVariantProduct([i, j]);
              } else {
                for(let k=0;k<variants[2].value.length;k++) {
                  this.pushVariantProduct([i, j, k]);
                }
              }
            }
          }
        }
      }
    } else {
      let i = 0;
      do {
        let pair = this.variant_products[i].pair;
        if(pair[a_index] == v_index || v_index == -1) {
          pair.splice(a_index, 1);
          let pair_str = this.getPairString(pair);
          let index = this.variant_products.findIndex(item => item.pair_str == pair_str);          
          if(pair.length < varLen || index > -1 || pair_str == '') {
            this.variant_products.splice(i, 1);
          } else {
            this.variant_products[i].pair = pair;
            this.variant_products[i].pair_str = pair_str;
            i++;
          }
        } else {
          if(pair[a_index] > v_index) {
            pair[a_index]--;
            this.variant_products[i].pair = pair;
            this.variant_products[i].pair_str = this.getPairString(pair);
          }
          i++;
        }
      } while (i < this.variant_products.length);
    }  

    function compare( a:any, b:any ) {
      if ( a.pair_str < b.pair_str ){
        return -1;
      }
      if ( a.pair_str > b.pair_str ){
        return 1;
      }
      return 0;
    }

    this.variant_products.sort( compare );     
    this.getVariantRowData();
  }

  getVariantColumns() {
    this.columns = [];
    for(let c of this.all_columns) {
      if(!this.product.data.tracking_inv) {
        if(['inventory', 'reorder_point', 'reorder_amount'].includes(c.prop)) {
          continue;
        }
      }
      this.columns.push(c);
    }
  }

  getVariantRowData() {
    this.loading = true;
    this.rows = [];
    for(let v of this.variant_products) {
      this.rows.push({
        name: this.productService.getVariantProductName(v),
        supply_price: UtilFunc.getPriceWithCurrency(v.supply_price),
        markup: v.markup + '%',
        retail_price: UtilFunc.getPriceWithCurrency(v.retail_price),
        enabled: v.enabled ? '<i class="far fa-check-circle fa-lg success"></i>':'<i class="far fa-times-circle fa-lg danger"></i>',
        inventory: v.inventory,
        reorder_point: v.reorder_point,
        reorder_amount: v.reorder_amount,
        image: v.image ? '<span><img src="' + this.getImagePath(v.image) + '" class="thumbnail"/></span>':'',
        sku: v.sku,
        supplier_code: v.supplier_code,
        pair_str: v.pair_str
      })
    }
    this.loading = false;
  }

  getNewVariantProduct() {
    let variantProduct:IVariantProduct = {
      _id: '',
      pair: [],
      pair_str: '',
      name: '',
      sku: '',
      supplier_code: '',
      supply_price: parseFloat(this.util.formatNumber(this.supply_price)),
      retail_price: parseFloat(this.util.formatNumber(this.retail_price)),
      enabled: true,
      inventory: 0,
      reorder_point: 0,
      reorder_amount: 0,
      markup: parseFloat(this.util.formatNumber(this.markup)),
      image: null
    };    
    return variantProduct;
  }

  getPairString(pair:any) {
    let str = [];
    for(let p of pair) {
      str.push(('0' + String(p)).substr(-2));
    }
    return str.join('_');
  }

  pushVariantProduct(new_pair:any) {
    let index = this.variant_products.findIndex(item => item.pair_str == this.getPairString(new_pair));    
    if(index == -1) {
      let product = this.getNewVariantProduct();
      product.pair = new_pair;
      product.pair_str = this.getPairString(product.pair);
      this.variant_products.push(product);
    }
  }

  async editVariantProduct(row:any) {
    const popover = await this.popoverController.create({
      component: EditVariantComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {pair_str: row.pair_str}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process) {
          this.getVariantRowData();
        }
      }
    });

    await popover.present();
  }

  removeVariantProduct(row:any) {
    if(this.variant_products.length==1) return;
    let index = this.variant_products.findIndex(item => item.pair_str == row.pair_str);
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this variant product?', () => {
      this.variant_products.splice(index, 1);
      this.getVariantRowData();
    })
  }

  setPrice(element: string): void {
    this.supply_price = this.form.get('supply_price').value;
    let ctrl_markup = this.form.get('markup'), ctrl_retail_price = this.form.get('retail_price');
    this.markup = (ctrl_markup.value) ? Number(ctrl_markup.value): 0;
    this.retail_price = (ctrl_retail_price.value) ? Number(ctrl_retail_price.value): this.supply_price;
    if (element === 'supply_price' || element === 'markup') {      
      this.retail_price = this.supply_price * (1 + this.markup / 100);         
      ctrl_retail_price.setValue(this.util.formatNumber(this.retail_price));   
    } else {
      if(this.supply_price > 0) {
        this.markup = 100 * (this.retail_price - this.supply_price) / this.supply_price;        
      }
      ctrl_markup.setValue(this.util.formatNumber(this.markup));
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

  async uploadImage(imageUrl: any) {
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
      this.images.push(result.body.path);
    }, async error => {
      await this.loadingService.dismiss();
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
        let index = this.images.indexOf(path);
        this.images.splice(index, 1);        
      }, async error => {
        await this.loadingService.dismiss();
        this.toastService.show(Constants.message.failedRemove);
      })
    })
  }

  async submit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.toastService.show('Please enter fields correctly');
      return;
    }
    const data = this.form.value;
    data.images = this.images;
    this.productService.tags = this.tags;    
    await this.loadingService.create();
    this.productService.save(data, async result => {
      await this.loadingService.dismiss();
      if(result.body.status == 'already_exist') {
        let fields = result.body.fields;
        if(fields.indexOf('name')!=-1){
          this.toastService.show('Already existing product name');
        }
        if(fields.indexOf('barcode')!=-1){
          this.toastService.show('Already existing barcode');
        }
      } else {        
        this.toastService.show(Constants.message.successSaved);        
        this.back();
      }
    }, error => {
      this.toastService.show(Constants.message.failedSave)
    })    
  }

  back() {
    this.nav.back();
  }

  getImagePath(path:string) {    
    return this.utilService.get_image(path);
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get handleInput(): any {return this.form.get('handle'); }
  get handleInputError(): string {
    if (this.handleInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get typeInput(): any {return this.form.get('type'); }
  get typeInputError(): string {
    if (this.typeInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get barcodeInput(): any {return this.form.get('barcode'); }
  get barcodeInputError(): string {
    if (this.barcodeInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get brandInput(): any {return this.form.get('brand'); }
  get brandInputError(): string {
    if (this.brandInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get supplierInput(): any {return this.form.get('supplier'); }
  get supplierInputError(): string {
    if (this.supplierInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get supplierCodeInput(): any {return this.form.get('supplier_code'); }
  get supplierCodeInputError(): string {
    if (this.supplierCodeInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get outletInput(): any {return this.form.get('outlet'); }
  get outletInputError(): string {
    if (this.outletInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get taxInput(): any {return this.form.get('tax'); }
  get taxInputError(): string {
    if (this.taxInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get supplyPriceInput(): any {return this.form.get('supply_price'); }
  get supplyPriceInputError(): string {
    if (this.supplyPriceInput.hasError('required')) {return Constants.message.requiredField; }    
  }
}
