import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-edit-product-type',
  templateUrl: './edit-product-type.component.html',
  styleUrls: ['./edit-product-type.component.scss'],
})
export class EditProductTypeComponent implements OnInit {
  
  title:string = 'Add New Product Type';  
  row:any;
  form: FormGroup;
  isSubmitted: boolean = false;
  dup_error: boolean = false;

  constructor(
    private popoverController: PopoverController,
    private utilService: UtilService,
    private toastService: ToastService,
    private loading: LoadingService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      touch: [false]
    })
  }

  ngOnInit() {
    if(this.row._id) {
      this.title = 'Edit Product Type';
      this.form.get('name').setValue(this.row.name);
      this.form.get('description').setValue(this.row.description);
      this.form.get('touch').setValue(this.row.touchable);
    }
  }

  async submit() {
    this.isSubmitted = true;  
    this.dup_error = false;
    if(this.form.invalid) return;    
    await this.loading.create();
    const data = this.form.value;    
    if(this.row._id) {
      data._id = this.row._id;
      this.utilService.put('product/type', data).subscribe(async result => {
        await this.final_process(result);
      })
    } else {     
      data.private_web_address = this.row.private_web_address; 
      this.utilService.post('product/type', data).subscribe(async result => {
        await this.final_process(result);
      })
    }
  }

  async final_process(result) {
    await this.loading.dismiss();
    if(result.body.status == 'already_exist') {      
      this.dup_error = true;
    } else {
      this.toastService.show(Constants.message.successSaved);
      this.popoverController.dismiss({process: true});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }        
    if (this.dup_error) {return 'Already existing type.';}
  }

}
