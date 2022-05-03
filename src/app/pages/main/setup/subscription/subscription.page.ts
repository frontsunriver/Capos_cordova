import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { ConfirmSubscriptionComponent } from 'src/app/components/confirm-subscription/confirm-subscription.component';
import { Store } from 'src/app/_classes/store.class';
import { APP_CONSTANTS, Constants } from 'src/app/_configs/constants';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
declare var $:any;

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.page.html',
  styleUrls: ['./subscription.page.scss'],
})
export class SubscriptionPage implements OnInit {
  title:string = 'Billing & Subscriptions';
  util = UtilFunc;
  plans = Constants.plans;
  renewal_date = '';
  basicAuth = 'Basic ' + btoa(APP_CONSTANTS.PAYPAL.CLIENT_ID + ':' + APP_CONSTANTS.PAYPAL.SECRET);  
  cancel_url = '';

  constructor(
    public store: Store,
    private loading: LoadingService,
    private popoverController: PopoverController,
    private authService: AuthService,
    private nav: NavController
  ) {
    this.store.load(() => {
      if(this.store.plan.subscriptionId) {
        this.getSubcriptionDetails(this.store.plan.subscriptionId);
      }
    });
  }

  ngOnInit() {
  }

  get isLoggedin():boolean {
    return this.authService.isLoggedIn;
  }

  async selectPlan(plan:any){
    const popover = await this.popoverController.create({
      component: ConfirmSubscriptionComponent,
      //event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {plan: plan}
    });
    popover.onDidDismiss().then(result => {
      if(result && result.data) {
        const data = result.data;
        if(data.process) {
          if(this.cancel_url) {
            this.cancelSubscription(() => {
              this.updatePlan(plan.id, data.subscriptionId);
            })
          } else {
            this.updatePlan(plan.id, data.subscriptionId);
          }
        }
      }
    })
    await popover.present();
  }

  // ============Start Get Subcription Details Method============================  
  async getSubcriptionDetails(subcriptionId:string) {  
    const self = this; this.cancel_url = '';
    await this.loading.create();
    const xhttp = new XMLHttpRequest();      
    const url = APP_CONSTANTS.IS_PRODUCT ? 'https://api.paypal.com/v1/billing/subscriptions/' : 'https://api.sandbox.paypal.com/v1/billing/subscriptions/';
    xhttp.onreadystatechange = async function () {  
      if (this.readyState === 4 && this.status === 200) {  
        const data = JSON.parse(this.responseText); 
        self.renewal_date = data.billing_info.next_billing_time;  
        const cc = data.links.find(item=>item.rel == 'cancel');
        if(cc) self.cancel_url = cc.href;
        if(data.status !== 'ACTIVE') {
          self.updatePlan('free');
        }
        await self.loading.dismiss();
      }  
    };  
    xhttp.open('GET', url + subcriptionId, true);  
    xhttp.setRequestHeader('Authorization', this.basicAuth);  
  
    xhttp.send();  
  }  

  async cancelSubscription(callback?:Function) {
    const xhttp = new XMLHttpRequest();  
    const url = this.cancel_url;
    await this.loading.create(); 
    const self = this;
    xhttp.onreadystatechange = async function () {  
      if (this.readyState === 4 && this.status === 204) {          
        await self.loading.dismiss();
        if(callback) callback();
      }  
    };  
    xhttp.open('POST', url); 
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader('Authorization', this.basicAuth);
    xhttp.send(JSON.stringify({ "reason": "New Subscription"}));
  }

  updatePlan(plan:string, subscriptionId: string='') {
    $('.' + this.store.plan.id).removeClass('selected');                
    this.store.plan.id = plan;
    $('.' + plan).addClass('selected');
    this.store.plan.subscriptionId = subscriptionId;
    if(plan!= 'free') this.getSubcriptionDetails(subscriptionId);
    this.store.save();
  }

  signin() {
    this.nav.navigateForward(['auth/sign-in']);
  }
}
