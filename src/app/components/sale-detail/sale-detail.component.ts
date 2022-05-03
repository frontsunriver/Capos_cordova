import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Cart } from 'src/app/_classes/cart.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss'],
})
export class SaleDetailComponent implements OnInit {
  cart: Cart;
  util = UtilFunc;
  completed_status = Constants.completed_status; 
  continue_status = Constants.continue_status;
  unfulfilled_status = Constants.unfulfilled_status;

  constructor(
    private popoverController: PopoverController,
    private alertService: AlertService,
  ) { }

  ngOnInit() {}

  dismiss() {
    this.popoverController.dismiss();    
  }

  getTooltip(sale:Cart) {
    if(this.continue_status.includes(sale.sale_status)) {
      return 'Continue Sale';
    }
    if(this.completed_status.includes(sale.sale_status)) {
      return 'Return Items';
    }
    if(this.unfulfilled_status.includes(sale.sale_status)) {
      return 'Mark as Complete';
    }
    return '';
  }

  handleAction(sale:Cart) {
    let action = 'new';
    if(this.completed_status.includes(sale.sale_status)) {
      action = 'return';
    }
    if(this.unfulfilled_status.includes(sale.sale_status)) {
      action = 'mark';
    }    
    this.popoverController.dismiss({action: action, sale: sale});
  }
  
  viewOriginalSale(sale_number:string) {
    if(sale_number) {
      this.popoverController.dismiss({action: 'view_origin', sale_number: sale_number});
    }
  }

  voidSale(sale: Cart) {        
    let title = 'You are about to void this sale.';
    let msg = 'This will return the products back into your inventory and remove any payments that were recorded. You’ll still be able to see the details of this sale once it has been voided. This can’t be undone.';
    this.alertService.presentAlertConfirm(title, msg, () => {      
      this.popoverController.dismiss({action: 'void_sale', sale: sale});
    }, null, 'Void Sale', 'Don\'t Void');
  }

  voidItems(sale:Cart) {
    this.popoverController.dismiss({action: 'void', sale: sale});
  }
}
