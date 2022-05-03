import { Component, OnInit } from '@angular/core';
import { Onlineorder } from 'src/app/_classes/onlineorder.class';
import { OnlineOrderService } from 'src/app/_services/online-order.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';
import { CountryModel } from 'src/app/_models/country-model';

@Component({
  selector: 'app-online-order-detail',
  templateUrl: './online-order-detail.component.html',
  styleUrls: ['./online-order-detail.component.scss'],
})
export class OnlineOrderDetailComponent implements OnInit {
  
  util = UtilFunc;
  countries:CountryModel[] = [];

  constructor(
    private onlineOrderService: OnlineOrderService,
    private utilService: UtilService,
    private nav: NavController
  ) {
    this.countries = this.utilService.countries;   
  }

  ngOnInit() {
    if(!this.order._id) {
      this.back();
    }    
  }

  ionViewDidEnter() {
    if(!this.onlineOrderService.changed && this.onlineOrderService.editable) {      
      this.onlineOrderService.init(this.order._id);
      this.onlineOrderService.editable = false;
    }
  }

  public get order():Onlineorder {
    return this.onlineOrderService.order;
  }

  public get title():string {
    return 'Order #' + this.order.reference;
  }

  getCountry(_id:string) {
    let index = this.countries.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.countries[index].country_name;
    }
    return '';
  }

  back() {
    this.nav.back();
  }

  edit() {
    this.nav.navigateForward(['edit-online-order']);
  }

}
