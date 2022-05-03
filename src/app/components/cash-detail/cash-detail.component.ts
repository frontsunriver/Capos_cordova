import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Openclose } from 'src/app/_classes/openclose.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-cash-detail',
  templateUrl: './cash-detail.component.html',
  styleUrls: ['./cash-detail.component.scss'],
})
export class CashDetailComponent implements OnInit {
  util = UtilFunc;
  openClose: Openclose

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  dismiss() {
    this.popoverController.dismiss();
  }

}
