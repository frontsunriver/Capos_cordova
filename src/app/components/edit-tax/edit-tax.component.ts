import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { ITax } from 'src/app/pages/main/setup/sales-taxes/sales-taxes.page';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrls: ['./edit-tax.component.scss'],
})
export class EditTaxComponent implements OnInit {
  title:string = 'Add New Tax';
  tax:ITax;
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
      rate: ['']
    })
  }

  ngOnInit() {
    if(this.tax._id) {
      this.title = 'Edit Tax';
      this.form.get('name').setValue(this.tax.name);
      this.form.get('rate').setValue(this.tax.rate);
    }
  }

  async submit() {
    this.isSubmitted = true;  
    this.dup_error = false;
    if(this.form.invalid) return;    
    await this.loading.create();
    const data = this.form.value;
    if(!data.rate) data.rate = 0;
    if(this.tax._id) {
      data._id = this.tax._id;
      this.utilService.put('sale/salestax', data).subscribe(async result => {
        await this.final_process(result);
      })
    } else {     
      data.private_web_address = this.tax.private_web_address; 
      this.utilService.post('sale/salestax', data).subscribe(async result => {
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
    if (this.dup_error) {return 'Already existing tax.';}
  }

}
