import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-edit-cash',
  templateUrl: './edit-cash.component.html',
  styleUrls: ['./edit-cash.component.scss'],
})
export class EditCashComponent implements OnInit {
  title:string = 'Add New Cash';
  form: FormGroup;
  main_outlet:any;
  user:any;
  cash:any;  
  isSubmitted:boolean = false;

  constructor(
    private popoverController:PopoverController,
    private utilService: UtilService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
      reasons: ['', [Validators.required]],
      transaction: ['', [Validators.required, Validators.min(1)]],
      is_credit: ['1']
    });
  }

  ngOnInit() {
    if(this.cash) {
      if(this.cash._id) this.title = 'Edit Cash';
      Object.keys(this.form.value).forEach(key => {
        this.form.get(key).setValue(this.cash[key]);
      })
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  async submit() {
    this.isSubmitted = true;
    if(this.form.invalid) return;
    await this.loading.create();
    const data = this.form.value;
    if(!data.rate) data.rate = 0;
    if(this.cash._id) {
      data._id = this.cash._id;
      this.utilService.put('sell/cash', data).subscribe(async result => {
        await this.final_process(result);
      })
    } else {     
      data.private_web_address = this.user.private_web_address;
      data.outlet = this.user.outlet ? this.user.outlet._id : this.main_outlet._id;
      data.user_id = this.user._id;
      data.register = this.user.outlet ? this.user.outlet.register[0] : this.main_outlet.registers[0];
      this.utilService.post('sell/cash', data).subscribe(async result => {
        await this.final_process(result);
      })
    }
  }

  async final_process(result) {
    await this.loading.dismiss();    
    this.toastService.show(Constants.message.successSaved);
    this.popoverController.dismiss({process: true});
  }

  get reasonsInput(): any {return this.form.get('reasons'); }
  get reasonsInputError(): string {
    if (this.reasonsInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get transactionInput(): any {return this.form.get('transaction'); }
  get transactionInputError(): string {
    if (this.transactionInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.transactionInput.hasError('min')) {return Constants.message.invalidMinValue.replace('?', Constants.cash_transaction.min.toString()); }    
  }
}
