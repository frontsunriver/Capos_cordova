import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-choose-variants',
  templateUrl: './choose-variants.component.html',
  styleUrls: ['./choose-variants.component.scss'],
})
export class ChooseVariantsComponent implements OnInit {

  product_name: string;
  util = UtilFunc;
  form: FormGroup;
  variant_products = [];
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    let form_control = {}; let index = 0;
    for(let cp of this.variant_products) {            
      form_control['checked' + index] = [false];
      index++;
    }    
    this.form = this.fb.group(form_control);
  }

  selVariant(index:number) {    
    let checked = this.form.get('checked' + index).value;    
    if(checked) {
      for(let i=0;i<this.variant_products.length;i++) {
        if(i!=index) {
          this.form.get('checked' + i).setValue(false);
        }
      }
    }
  }

  public get isValid() {
    for(let i=0;i<this.variant_products.length;i++) {
      if(this.form.get('checked' + i).value) {
        return true;
      }
    }
    return false;
  }

  doAction(){
    this.isSubmitted = true;
    if(this.form.valid) {
      let variant;
      for(let i=0;i<this.variant_products.length;i++) {
        let checked = this.form.get('checked' + i).value;
        if(checked) {
          variant = this.variant_products[i];
          break;
        }
      }
      this.popoverController.dismiss({process: true, variant_id: variant._id})
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
