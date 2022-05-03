import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { Openclose } from 'src/app/_classes/openclose.class';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { CashDetailComponent } from 'src/app/components/cash-detail/cash-detail.component';
import { AlertService } from 'src/app/_services/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/_services/cart.service';

@Component({
  selector: 'app-open-register',
  templateUrl: './open-register.page.html',
  styleUrls: ['./open-register.page.scss'],
})
export class OpenRegisterPage implements OnInit {
  title = {open: 'Open Register', close: 'Close Register'};
  user: any;  
  util = UtilFunc;
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private loading: LoadingService,
    private toastService: ToastService,    
    private nav: NavController,    
    private popoverController: PopoverController,
    private alertService: AlertService,
    private cartService: CartService,
    private fb: FormBuilder
  ) {
    this.authService.checkPremission('close_register');    
    this.form = this.fb.group({
      open_value: ['', [Validators.required, Validators.min(1)]],
      open_note: ['']
    })
  }

  ngOnInit() {
    
  }

  public get mode():string {
    if(this.cartService.openClose._id) {
      return 'close';
    } else {
      return 'open';
    }
  }

  public get openClose():Openclose {
    return this.cartService.openClose;
  }

  public get lastClose():Openclose {
    return this.cartService.lastClose;
  }

  async save(){
    this.isSubmitted = true;
    if(this.form.valid){
      const data = this.form.value;
      await this.loading.create();
      this.cartService.openRegister(data, async result => {
        await this.loading.dismiss();
        if(result){
          this.toastService.show(Constants.message.successOpenRegister);
        } else {
          this.toastService.show(Constants.message.failedSave);
        }
      })
    }      
  }

  async openCashDetail(openClose: Openclose) {
    const popover = await this.popoverController.create({
      component: CashDetailComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {openClose: openClose}
    });

    await popover.present();   
  }

  closeRegister(){
    let title = 'Close Register';
    let msg = 'Are you sure to want to close this register?';
    this.alertService.presentAlertConfirm(title, msg, () => {      
      this.cartService.closeRegister(() => {
        this.toastService.show('Register Closed successfully.');
      })      
    });
  }

  get floatInput(): any {return this.form.get('open_value'); }
  get floatInputError(): string | void {    
    if (this.floatInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.floatInput.hasError('min')) { return Constants.message.invalidMinValue.replace('?', Constants.open_value.min.toString()); }
  } 
}
