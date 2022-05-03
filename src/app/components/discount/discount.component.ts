import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
})
export class DiscountComponent implements OnInit {
  form: FormGroup;
  discount: any;
  is_global:boolean = true;
  isSubmitted:boolean = false;
  mode: string = 'Add';

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      mode:[''],
      value: ['']
    }); 
  }

  ngOnInit() {
    if(this.discount.value) this.mode = 'Change';
    this.form.get('mode').setValue(this.discount.mode);
    this.form.get('value').setValue(this.discount.value);
  }

  doAction(){
    this.isSubmitted = false;
    if(this.form.valid){     
      const data = this.form.value;
      if(!data.value) data.value = 0;
      this.popoverController.dismiss({process: true, discount: data});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get mode_label():string {
    if(this.form.get('mode').value == 'percent') 
      return '%';
    return '$';
  }
}
