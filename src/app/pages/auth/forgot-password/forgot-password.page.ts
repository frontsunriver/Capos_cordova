import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordPage implements OnInit {

  isSubmitted: boolean = false;
  title: string = 'Forgot Password';
  hide = true;
  form: FormGroup;
  email_error: string = '';
  sticky:boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private nav: NavController,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    
  }

  async submit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    this.email_error = '';
    await this.loading.create();
    this.authService.forgotPassword(this.form.value).subscribe(async result => {      
      await this.loading.dismiss();
      if (result.error) {
        this.email_error = result.error;        
      } else {        
        this.nav.navigateForward(['auth/sign-in']);
        this.toastService.show('New password has been sent in your email.');
      }
    }, async error => {      
      await this.loading.dismiss();
      this.toastService.show('Server Error. Try again later.');
    });
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
    if(this.email_error == 'no_existing_email') {return 'No existing email';}
    if(this.email_error == 'incorrect_email') {return 'Error while emailing. Please check if email is correct.';}
  }
}
