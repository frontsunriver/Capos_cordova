import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { IOrderProduct } from 'src/app/_classes/order.class';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-edit-variant-qty',
  templateUrl: './edit-variant-qty.component.html',
  styleUrls: ['./edit-variant-qty.component.scss'],
})
export class EditVariantQtyComponent implements OnInit {

  product:IOrderProduct;
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      qty: ['', [Validators.required]],
      supply_price: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    Object.keys(this.form.value).forEach(key => {
      this.form.get(key).setValue(this.product[key]);
    })
  }

  submit(){
    this.isSubmitted = true;
    if(this.form.valid) {
      Object.keys(this.form.value).forEach(key => {
        this.product[key] = this.form.get(key).value;
      })
      this.popoverController.dismiss({process: true, product: this.product});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get qtyInput(): any {return this.form.get('qty'); }
  get qtyInputError(): string {
    if (this.qtyInput.hasError('required')) {return Constants.message.requiredField; }        
  }

  get priceInput(): any {return this.form.get('supply_price'); }
  get priceInputError(): string {
    if (this.priceInput.hasError('required')) {return Constants.message.requiredField; }        
  }

}
