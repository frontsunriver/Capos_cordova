import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/_services/toast.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from 'src/app/_configs/constants';

import { Payment } from 'src/app/_classes/payment.class';

@Component({
  selector: 'app-store-management',
  templateUrl: './store-management.page.html',
  styleUrls: ['./store-management.page.scss'],
})
export class StoreManagementPage implements OnInit {
  title = 'Store Management';
  user: any;
  permission: boolean = false;
  cur_tab: string = 'payment';
  cur_receipter_tab: string = 'header';

  chk_payments = Payment.PAYMENT_TYPES;

  header1: String = "";
  header1Status: Boolean = false;
  header2: String = "";
  header2Status: Boolean = false;
  header3: String = "";
  header3Status: Boolean = false;
  header4: String = "";
  header4Status: Boolean = false;
  header5: String = "";
  header5Status: Boolean = false;
  policy1: String = "";
  policy1Status: Boolean = false;
  policy2: String = "";
  policy2Status: Boolean = false;
  policy3: String = "";
  policy3Status: Boolean = false;
  policy4: String = "";
  policy4Status: Boolean = false;
  policy5: String = "";
  policy5Status: Boolean = false;
  marketing1: String = "";
  marketing1Status: Boolean = false;
  marketing2: String = "";
  marketing2Status: Boolean = false;
  marketing3: String = "";
  marketing3Status: Boolean = false;
  marketing4: String = "";
  marketing4Status: Boolean = false;
  marketing5: String = "";
  marketing5Status: Boolean = false;
  ticketPolicy: String = "";
  ticketPolicyStatus: Boolean = false;
  pole1: String = "";
  pole2: String = "";
  private_web_address: String = "";

  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    public payment: Payment,
    public jwtHelper: JwtHelperService,
    private utilService: UtilService,
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('manage_payment_type');
      }
    });
    this.payment.load();
  }

  ngOnInit(): void {
    const tkn = this.authService.getToken();
    const decoded = this.jwtHelper.decodeToken(tkn);
    this.private_web_address = decoded.private_web_address;
    this.getReceiptTemplate();
  }

  getReceiptTemplate(): void {
    this.utilService.get('sell/receipttemplate', { private_web_address: this.private_web_address }).subscribe(result => {
      if (result && result.body) {
        this.header1 = result.body.header1;
        this.header1Status = result.body.header1Status;
        this.header2 = result.body.header2;
        this.header2Status = result.body.header2Status;
        this.header3 = result.body.header3;
        this.header3Status = result.body.header3Status;
        this.header4 = result.body.header4;
        this.header4Status = result.body.header4Status;
        this.header5 = result.body.header5;
        this.header5Status = result.body.header5Status;
        this.policy1 = result.body.policy1;
        this.policy1Status = result.body.policy1Status;
        this.policy2 = result.body.policy2;
        this.policy2Status = result.body.policy2Status;
        this.policy3 = result.body.policy3;
        this.policy3Status = result.body.policy3Status;
        this.policy4 = result.body.policy4;
        this.policy4Status = result.body.policy4Status;
        this.policy5 = result.body.policy5;
        this.policy5Status = result.body.policy5Status;
        this.marketing1 = result.body.marketing1;
        this.marketing1Status = result.body.marketing1Status;
        this.marketing2 = result.body.marketing2;
        this.marketing2Status = result.body.marketing2Status;
        this.marketing3 = result.body.marketing3;
        this.marketing3Status = result.body.marketing3Status;
        this.marketing4 = result.body.marketing4;
        this.marketing4Status = result.body.marketing4Status;
        this.marketing5 = result.body.marketing5;
        this.marketing5Status = result.body.marketing5Status;
        this.ticketPolicy = result.body.ticketPolicy;
        this.ticketPolicyStatus = result.body.ticketPolicyStatus;
        this.pole1 = result.body.pole1;
        this.pole2 = result.body.pole2;
      }
    });
  }

  onSave(): void {
    const data = {
      private_web_address: 'newonestore',
      header1: this.header1,
      header1Status: this.header1Status,
      header2: this.header2,
      header2Status: this.header2Status,
      header3: this.header3,
      header3Status: this.header3Status,
      header4: this.header4,
      header4Status: this.header4Status,
      header5: this.header5,
      header5Status: this.header5Status,
      policy1: this.policy1,
      policy1Status: this.policy1Status,
      policy2: this.policy2,
      policy2Status: this.policy2Status,
      policy3: this.policy3,
      policy3Status: this.policy3Status,
      policy4: this.policy4,
      policy4Status: this.policy4Status,
      policy5: this.policy5,
      policy5Status: this.policy5Status,
      marketing1: this.marketing1,
      marketing1Status: this.marketing1Status,
      marketing2: this.marketing2,
      marketing2Status: this.marketing2Status,
      marketing3: this.marketing3,
      marketing3Status: this.marketing3Status,
      marketing4: this.marketing4,
      marketing4Status: this.marketing4Status,
      marketing5: this.marketing5,
      marketing5Status: this.marketing5Status,
      ticketPolicy: this.ticketPolicy,
      ticketPolicyStatus: this.ticketPolicyStatus,
      pole1: this.pole1,
      pole2: this.pole2
    }
    this.utilService.post('sell/receipttemplate', data).subscribe((res) => {
      if (res) {
        this.toastService.show('Receipt print template save successfully');
      }
    });
  }

  getPaymentLabel(p) {
    return Payment.getPaymentLabel(p);
  }

  subStatus(p) {
    if (p === 'visa' || p === 'master' || p === 'amex' || p === 'discover' || p === 'diners' || p === 'jcb' ) {
      return true;
    }
    return false;
  }

  save() {
    this.payment.save(() => {
      // TODO:
      this.toastService.show(Constants.message.successSaved);
    })
  }

}
