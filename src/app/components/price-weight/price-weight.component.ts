import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { EditCashComponent } from '../edit-cash/edit-cash.component';

@Component({
  selector: 'app-price-weight',
  templateUrl: './price-weight.component.html',
  styleUrls: ['./price-weight.component.scss'],
})
export class PriceWeightComponent implements OnInit {
  
  form: FormGroup;
  mode: string = 'Add';
  msg: string = '';
  is_price: boolean = false;
  is_weight: boolean = false;
  is_serial: boolean = false;
  data:any;
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    let group = {prompt_price: null, weight: null, serial: null};
    if(typeof this.data.price != 'undefined') {
      if(this.data.price) this.mode = 'Change';
      this.msg = 'price';
      group.prompt_price = [this.data.price, [Validators.required, Validators.min(1)]];
      this.is_price = true;
    } else {
      delete group.prompt_price;
    }
    if(typeof this.data.weight != 'undefined') {
      group.weight = [this.data.weight, [Validators.required, Validators.min(0)]];
      if(this.data.weight) this.mode = 'Change';
      if(this.msg) this.msg += ' & ';
      this.msg += 'weight';
      this.is_weight = true;
    } else {
      delete group.weight;
    }
    if(typeof this.data.serial != 'undefined') {
      group.serial = [this.data.serial, [Validators.required]];
      if(this.data.serial) this.mode = 'Change';
      if(this.msg) this.msg += ' & ';
      this.msg += 'product serial';
      this.is_serial = true;
    }
    this.form = this.fb.group(group);  
  }

  async dismiss() {
    this.popoverController.dismiss();    
  }

  doAction(){
    this.isSubmitted = true;
    if(this.form.valid){    
      const data = this.form.value;    
      data.process = true;     
      this.popoverController.dismiss(data);
    }
  }

  get priceInput(): any {return this.form.get('prompt_price'); }
  get priceInputError(): string {
    if(this.priceInput) {
      if (this.priceInput.hasError('required')) {return Constants.message.requiredField; }    
      if (this.priceInput.hasError('min')) {return Constants.message.invalidMinValue.replace('?', '1'); }    
    }
  }

  get weightInput(): any {return this.form.get('weight'); }
  get weightInputError(): string {
    if(this.weightInput) {
      if (this.weightInput.hasError('required')) {return Constants.message.requiredField; }    
      if (this.weightInput.hasError('min')) {return Constants.message.invalidMinValue.replace('?', '0'); }
    }
  }

  get serialInput(): any {return this.form.get('serial'); }
  get serialInputError(): string {
    if(this.serialInput) {
      if (this.serialInput.hasError('required')) {return Constants.message.requiredField; }          
    }
  }
}
