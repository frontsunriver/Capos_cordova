import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { CartProduct } from 'src/app/_classes/cart_product.class';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-edit-online-order-product',
  templateUrl: './edit-online-order-product.component.html',
  styleUrls: ['./edit-online-order-product.component.scss'],
})
export class EditOnlineOrderProductComponent implements OnInit {
  
  product:CartProduct;
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      qty: ['', [Validators.required]],
      discount_mode: ['percent'],
      discount_value: ['']
    })
  }

  ngOnInit() {
    this.form.get('qty').setValue(this.product.qty);
    this.form.get('discount_mode').setValue(this.product.discount.mode);
    this.form.get('discount_value').setValue(this.product.discount.value);
  }

  submit(){
    this.isSubmitted = true;
    if(this.form.valid) {
      const data = this.form.value;
      if(!data.discount) data.discount = 0;
      data.process = true;      
      this.popoverController.dismiss(data);
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get qtyInput(): any {return this.form.get('qty'); }
  get qtyInputError(): string {
    if (this.qtyInput.hasError('required')) {return Constants.message.requiredField; }        
  }

}
