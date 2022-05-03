import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AuthRoutingModule } from './auth-routing.module';
import { ShareModule } from '../../_shared/share.module';
import { SignInPage } from './sign-in/sign-in.page';
import { SignUpPage } from './sign-up/sign-up.page';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';
// import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  declarations: [
    SignInPage, 
    SignUpPage,
    ForgotPasswordPage
    // VerifyEmailComponent, 
  ],
  imports: [
    CommonModule,
    IonicModule,
    ShareModule,
    AuthRoutingModule,
  ]
})
export class AuthModule { }
