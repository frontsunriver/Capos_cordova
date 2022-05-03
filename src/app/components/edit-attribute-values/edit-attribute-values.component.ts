import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { IVariants } from 'src/app/_classes/product.class';
import { Constants } from 'src/app/_configs/constants';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { IVariant, ProductService } from 'src/app/_services/product.service';

@Component({
  selector: 'app-edit-attribute-values',
  templateUrl: './edit-attribute-values.component.html',
  styleUrls: ['./edit-attribute-values.component.scss'],
})
export class EditAttributeValuesComponent implements OnInit {

  title: string = 'Rename Values for this Product';
  form: FormGroup;
  util = UtilFunc;  
  group = {};
  requiredField = Constants.message.requiredField;  
  attributes = [];
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private popoverController: PopoverController
  ) {    
    this.group = {};
    for(let i=0;i<this.variants.length;i++) {
      let name = 'value' + i;
      for(let j=0;j<this.variants[i].value.length;j++) {
        let name1 = name + '_' + j;
        this.group[name1] = [this.variants[i].value[j].value, [Validators.required]];
      }
    }            
    this.form = this.fb.group(this.group);
  }

  public get variants():IVariant[]{
    return this.productService.variants;
  }

  ngOnInit() {}

  getAttribute(id:any) {
    let index = this.attributes.findIndex(item => item._id == id);
    if(index > -1) {
      return this.attributes[index].name;
    }
    return '';
  }

  getError(index1:number, index2:number) {    
    let ctrl = this.form.get('value' + index1 + '_' + index2);
    return ctrl.hasError('required');
  }

  submit() {
    this.isSubmitted = true;
    if(this.form.valid){            
      for(let i=0;i<this.variants.length;i++) {
        let name = 'value' + i;
        for(let j=0;j<this.variants[i].value.length;j++) {
          let name1 = name + '_' + j;
          this.variants[i].value[j].display = this.form.get(name1).value;
          this.variants[i].value[j].value = this.form.get(name1).value;
        }
      } 
      this.popoverController.dismiss({process: true});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
