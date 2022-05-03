import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.scss'],
})
export class ConfirmPasswordComponent implements OnInit {
  
  form: FormGroup;
  util = UtilFunc;
  hide: boolean = true; 
  isSubmitted: boolean = false;
  private_web_address: string = '';
  email: string = '';

  constructor(
    private utilService: UtilService,
    private toastService: ToastService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      password:['', [Validators.required]]     
    });
  }

  ngOnInit() {}

  doAction(){
    this.isSubmitted = true;
    if(this.form.valid){      
      const data = this.form.value;
      data.private_web_address = this.private_web_address;      
      data.email = this.email;      
      this.utilService.post('auth/confirm-password', data).subscribe((result) => {                    
        if(result && result.body) {
          let s = result.body;
          if(s.error == 0) {
            this.toastService.show(Constants.message.validPassword);
            this.popoverController.dismiss({process: true});
          } else {
            this.toastService.show(s.msg);
          }
        }        
      }, error => {this.toastService.show(error.error)});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get passwordInput(): any {return this.form.get('password'); }
  get passwordInputError(): string {
    if (this.passwordInput.hasError('required')) {return Constants.message.requiredField; }    
  }

}
