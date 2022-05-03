import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { LoadingService } from 'src/app/_services/loading.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { APP_CONSTANTS } from 'src/app/_configs/constants';
import { DOCUMENT } from '@angular/common';
import { ToastService } from 'src/app/_services/toast.service';
declare var paypal;

@Component({
  selector: 'app-confirm-subscription',
  templateUrl: './confirm-subscription.component.html',
  styleUrls: ['./confirm-subscription.component.scss'],
})
export class ConfirmSubscriptionComponent implements OnInit, AfterViewInit {
  @ViewChild('paypal') paypalElement: ElementRef;
  util = UtilFunc;
  planId:string = '';
  plan: any;

  constructor(
    private loading: LoadingService,
    private popoverController: PopoverController,
    private toastService: ToastService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if(this.plan.id != 'free') {
      this.planId = APP_CONSTANTS.PLANS[(this.plan.id).toUpperCase()];      
    }
    this.loadPaypalScript();
  }

  loadPaypalScript() {
    if(!window.document.getElementById('paypal-script')) {
      let script = this._renderer2.createElement('script');
      script.id = "paypal-script";
      script.src = 'https://www.paypal.com/sdk/js?client-id=' + APP_CONSTANTS.PAYPAL.CLIENT_ID + '&vault=true';
      script.type = 'text/javascript';
      if (script.readyState) {  //IE
        script.onreadystatechange = () => {        
          if (script.readyState === "loaded" || script.readyState === "complete") {
            this.loadPaypal();
          }
        };
      } else {  //Others
        script.onload = () => {
          this.loadPaypal();
        };
      }
      this._renderer2.appendChild(this._document.body, script);
    } else {
      this.loadPaypal();
    }
  }

  async loadPaypal() {
    const self = this;    
    //await this.loading.create();
    if(paypal && this.plan.id != 'free') {
      paypal.Buttons({  
        style: {
          layout:  'vertical',
          color:   'blue',
          shape:   'rect',
          label:   'paypal',
          size: 'responsive'
        },
        createSubscription: function (data, actions) {              
          //await self.loading.dismiss();
          return actions.subscription.create({  
            'plan_id': self.planId,  
          });  
        },  
        onApprove: function (data, actions) {            
          self.toastService.show('You have successfully created subscription ' + data.subscriptionID);            
          self.doAction(data.subscriptionID);
        },  
        onCancel: function (data) {  
          // Show a cancel page, or return to cart  
          console.log(data);  
        },  
        onError: function (err) {  
          // Show an error page here, when an error occurs  
          console.log(err);  
        }  
    
      }).render(this.paypalElement.nativeElement); 
    }
  }

  doAction(subscriptionId:any=null){
    this.popoverController.dismiss({process: true, subscriptionId: subscriptionId});
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
