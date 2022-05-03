import { Injectable } from '@angular/core';
import { IVariants, Product } from '../_classes/product.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

export interface ITag{
  display: string,
  value: string
}
export interface IVariant{
  attribute: string,
  value:ITag[]
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  product:Product;
  changed: boolean = false;
  tags:ITag[] = [];  
  variants:IVariant[] = [{attribute:'', value:[]}];  
  old_variants:IVariant[] = [{attribute:'', value:[]}];      
  user:any;

  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    })
    this.init();
  }

  init(detail?:any) {
    this.product = new Product(this.authService, this.utilService);    
    this.tags = [];
    this.variants = [{attribute:'', value:[]}];  
    this.old_variants = [{attribute:'', value:[]}];    
    if(detail) {
      this.product.loadDetails(detail);
      this.loadVariants(); 
      this.getOldVariants();      
    }
  }

  loadVariants() {
    this.tags = [];
    for(let t of this.product.data.tag) {
      this.tags.push({
        display: t,
        value: t
      })
    }    
    this.variants = []; this.old_variants = [];
    for(let v of this.product.data.variants) {
      let data:IVariant = {
        attribute: v.attribute,
        value: []
      }        
      for(let vv of v.value) {
        data.value.push({
          display: vv,
          value: vv
        })
      }
      this.variants.push(data);
    }
  }

  getOldVariants() {
    this.old_variants = [];
    for(let v of this.variants) {
      let t:IVariant = {
        attribute: v.attribute,
        value: [...v.value]
      }
      this.old_variants.push(t);
    }
  }

  getIndexOfValue(attrIndex:number, value: string) {
    return this.old_variants[attrIndex].value.findIndex(item => item.value == value);
  }

  getVariantProductName(product:any) {
    let pair = product.pair;
    let str = [];
    for(let i=0;i<pair.length;i++) {
      str.push(this.variants[i].value[pair[i]].value);
    }
    return str.join('/');
  }

  save(data:any, callback?:Function, err?:Function) {
    Object.keys(data).forEach(key => {
      this.product.data[key] = data[key];
    })
    if(!this.product.data.tracking_inv || this.product.data.variant_inv) {
      this.product.data.inventory = 0;
      this.product.data.reorder_point = 0;
      this.product.data.reorder_amount = 0;
    }
    if (this.product.data.variant_inv) {
      this.product.data.sku = '';
    }
    this.product.data.tag = [];
    for(let t of this.tags) {
      this.product.data.tag.push(t.value);
    }
    this.product.data.variants = [];
    for(let va of this.variants) {
      if(va.attribute && va.value.length>0) {
        let data:IVariants = {
          attribute: va.attribute,
          value: []
        }
        for(let v of va.value) {
          data.value.push(v.value);
        }
        this.product.data.variants.push(data);
      }
    }
    for(let p of this.product.data.variant_products) {
      p.name = this.getVariantProductName(p);
    }
    this.product.data.private_web_address = this.user.private_web_address;
    this.product.data.user_id = this.user._id;   
    this.product.save(result => {      
      this.changed = true;
      if(callback) callback(result);
    }, error => {

    })
  }
}
