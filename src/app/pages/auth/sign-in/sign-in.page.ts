import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignInPage implements OnInit {

  isSubmitted: boolean = false;
  title: string = 'Sign In';
  hide = true;
  form: FormGroup;
  invalidEmailOrPwd: boolean;
  sticky: boolean = false;
  signin_error = {
    private_web_address: false,
    email: false,
    password: false
  }

  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private authService: AuthService,
    private toastService: ToastService,
    private utilService: UtilService,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
      private_web_address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
    });
  }

  ngOnInit(): void {
    
  }

  scroll(event:any) {    
    const num = event.detail.scrollTop;
    this.sticky = num > 40;
  }

  async submit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    this.signin_error = {
      private_web_address: false,
      email: false,
      password: false
    }
    await this.loading.create();
    this.authService.signIn(this.form.value).subscribe(async result => {            
      if (result.error) {
        await this.loading.dismiss();
        if(result.error == 'private_web_address') {
          this.signin_error.private_web_address = true;
        } else if (result.error == 'email') {
          this.signin_error.email = true;
        } else {
          this.signin_error.password = true;
        }
      } else {
        let user = result.token;
        if (user.email_verify) {
          await this.loading.dismiss();
          if(this.utilService.isOnline && !this.utilService.is_downloaded) {
            this.nav.navigateForward(['loading']);
          } else {
            this.nav.navigateForward(['main/home']);
          }
          this.toastService.show(Constants.message.successLogin);          
        } else {
          if(this.utilService.isOnline) {
            this.utilService.post('auth/send-email-verification', {email: user.email}).subscribe(async response => {
              await this.loading.dismiss();
              this.toastService.show(Constants.message.notVerifiedEmail);
            }, async error => {
              await this.loading.dismiss();
              this.toastService.show('Server Error. Try again later.');      
            });
          } else {
            await this.loading.dismiss();
            this.toastService.show('Can\'t use offline mode with unverified email.');
          }
        }
      }
    }, async error => {      
      await this.loading.dismiss();
      this.toastService.show('Server Error. Try again later.');
    });
  }

  get storeNameInput(): any {return this.form.get('private_web_address'); }
  get storeNameInputError(): string {
    if (this.storeNameInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.signin_error.private_web_address) {return 'Incorrect private web address';}
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.signin_error.email) {return 'No existing email';}
  }

  get passwordInput(): any {return this.form.get('password'); }
  get passwordInputError(): string {
    if (this.passwordInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.passwordInput.hasError('minlength')) { return Constants.message.invalidMinLength.replace('?', Constants.password.minLength.toString()); }
    if (this.passwordInput.hasError('maxlength')) { return Constants.message.invalidMaxLength.replace('?', Constants.password.maxLength.toString()); }
    if (this.signin_error.password) {return 'Incorrect password';}
  }
}
