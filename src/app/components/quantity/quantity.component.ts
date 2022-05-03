import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-quantity',
  templateUrl: './quantity.component.html',
  styleUrls: ['./quantity.component.scss'],
})
export class QuantityComponent implements OnInit {
  quantity:string = '';
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  enterNum(str) {    
    if(str == '.') {
     if(!this.quantity.toString().includes('.')) this.quantity += '.';
    } else {
      this.quantity += str;
    }
  }

  backspace() {
    let len = this.quantity.length;
    if(len > 0) {
      this.quantity = this.quantity.toString().substring(0, len-1);
    }
  }

  clear() {
    this.quantity = '';
  }

  doAction(){
    if(this.quantity) {
      let qty = parseInt(this.quantity);    
      this.popoverController.dismiss({process: true, qty: qty});
    }
  }
  
  dismiss() {
    this.popoverController.dismiss();
  }

}
