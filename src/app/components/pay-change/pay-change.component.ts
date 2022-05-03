import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-pay-change',
  templateUrl: './pay-change.component.html',
  styleUrls: ['./pay-change.component.scss'],
})
export class PayChangeComponent implements OnInit {

  current_seconds: number = 10;
  timer: any;
  change:string = '';

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    this.timer = setInterval(() => {
      if(this.current_seconds<0) {        
        this.doAction();
      }
      this.current_seconds--;      
    }, 1000);
  }

  doAction(){
    clearInterval(this.timer);
    this.dismiss();
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
