import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-user-switch',
  templateUrl: './user-switch.component.html',
  styleUrls: ['./user-switch.component.scss'],
})
export class UserSwitchComponent implements OnInit {
  form:FormGroup;
  user: any;
  isSubmitted: boolean = false;
  hide: boolean = true;
  signin_error = {
    email: false,
    password: false
  };

  constructor(
    private popoverController: PopoverController,
    private fb:FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private nav: NavController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    })
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit() {}

  submit() {
    this.isSubmitted = true;
    this.signin_error = {
      email: false,
      password: false
    };
    if(this.form.valid) {
      const data = {
        private_web_address: this.user.private_web_address,
        email: this.form.get('email').value,
        password: this.form.get('password').value
      }      
      this.authService.signIn(data).subscribe(result => {
        if (result.error) {
          if (result.error == 'email') {
            this.signin_error.email = true;
          } else {
            this.signin_error.password = true;
          }
        }else {
          if (result.email_verify) {  
            this.toastService.show(Constants.message.successSwitch);
            this.popoverController.dismiss();
            this.nav.navigateForward(['main/home']);
          } else {
            this.toastService.show(Constants.message.notVerifiedEmail);              
          }
        }
      }, error => {          
        this.toastService.show(Constants.message.noExistingUser);
      });      
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.emailInput.hasError('email')) {return Constants.message.validEmail; } 
    if (this.signin_error.email) {return 'No existing email';}   
  }

  get passwordInput(): any {return this.form.get('password'); }
  get passwordInputError(): string {
    if (this.passwordInput.hasError('required')) {return Constants.message.requiredField; }   
    if (this.signin_error.password) {return 'Incorrect password';}
  }
}
