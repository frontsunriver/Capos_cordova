import { Component, OnInit } from '@angular/core';
import { Payment } from 'src/app/_classes/payment.class';
import { Store } from 'src/app/_classes/store.class';
import { Group } from 'src/app/_classes/group.class';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';

@Component({
  selector: 'app-customer-point-gift',
  templateUrl: './customer-point-gift.page.html',
  styleUrls: ['./customer-point-gift.page.scss'],
})
export class CustomerPointGiftPage implements OnInit {
  title:string = 'Customer Point & Gift';
  payment: Payment;
  chk_settings = Store.CUSTOMER_POINT_GIFT;
  active_payments:string[] = [];
  point_rates = [];
  groups:Group[] = [];
  permission: boolean = true;

  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    private utilService: UtilService,
    public store: Store,
    private loading: LoadingService
  ) {
    this.store.load();
    this.payment = new Payment(this.authService, this.utilService);
  }

  ngOnInit() {
    this.utilService.get('customers/group', {}).subscribe(result => {
      if(result && result.body) {
        for(let g of result.body) {
          let group = new Group(this.authService, this.utilService);
          group.loadDetails(g);
          this.groups.push(group);
        }        
        this.payment.load(() => {
          for(let s of this.payment.payments) {
            if(!['layby', 'store_credit', 'on_account'].includes(s)) {
              this.active_payments.push(s);
            }
          }
        });
      }
    })
  }

  getPaymentLabel(p:string) {
    return Payment.getPaymentLabel(p);
  }

  async save() {
    await this.loading.create();
    this.store.save(async () => {      
      this.toastService.show(Constants.message.successSaved);
      for(let g of this.groups) {
        g.save();
      }
      await this.loading.dismiss();
    })
  }
}
