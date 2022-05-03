import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-pay-amount',
  templateUrl: './pay-amount.component.html',
  styleUrls: ['./pay-amount.component.scss'],
})
export class PayAmountComponent implements OnInit {

  util = UtilFunc;
  amount:string = '';
  total_amount_to_pay:number = 0;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    this.amount = this.total_amount_to_pay.toString();
  }

  enterNum(str) {    
    if(str == '.') {
     if(!this.amount.toString().includes('.')) this.amount += '.';
    } else {
      this.amount += str;
    }
  }

  backspace() {
    let len = this.amount.length;
    if(len > 0) {
      this.amount = this.amount.toString().substring(0, len-1);
    }
  }

  clear() {
    this.amount = '';
  }

  doAction(){
    if(this.amount) {
      let amount = parseFloat(this.amount);    
      this.popoverController.dismiss({process: true, amount: amount});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
