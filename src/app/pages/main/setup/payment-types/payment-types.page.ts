import { Component, OnInit } from '@angular/core';
import { Payment } from 'src/app/_classes/payment.class';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-payment-types',
  templateUrl: './payment-types.page.html',
  styleUrls: ['./payment-types.page.scss'],
})
export class PaymentTypesPage implements OnInit {
  title:string = 'Payment Types';
  user: any;
  permission: boolean = false;
  chk_payments = Payment.PAYMENT_TYPES;
  
  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    public payment: Payment,
    private loading: LoadingService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('manage_payment_type');
      }
    });
    this.payment.load();
  }

  ngOnInit() {
  }

  getPaymentLabel(p) {
    return Payment.getPaymentLabel(p);
  }

  async save() {
    await this.loading.create();
    this.payment.save(async () => {
      await this.loading.dismiss();
      this.toastService.show(Constants.message.successSaved);
    })
  }

}
