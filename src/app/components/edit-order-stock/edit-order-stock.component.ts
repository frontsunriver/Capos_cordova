import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Order } from 'src/app/_classes/order.class';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { OrderService } from 'src/app/_services/order.service';
import { EditOrderStockContentComponent } from '../edit-order-stock-content/edit-order-stock-content.component';

@Component({
  selector: 'app-edit-order-stock',
  templateUrl: './edit-order-stock.component.html',
  styleUrls: ['./edit-order-stock.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditOrderStockComponent implements OnInit {
  title:string = 'Add Purchase Order';  
  @ViewChild('orderContent') orderConent: EditOrderStockContentComponent;

  constructor(
    private nav: NavController,
    private orderService: OrderService
  ) {
    
  }

  ngOnInit() {    
    if(this.order._id) {
      this.title = 'Edit Purchase Order';      
    }
  }

  public get order():Order {
    return this.orderService.order;
  }

  public get isEdit():boolean {
    return this.order._id != '';
  }

  back() {
    this.nav.back();
  }  

  submit(){
    this.orderConent.submit();
  }
  
  ionViewDidEnter() {
    this.orderConent.loadFormData();
  }

  saveAndReceive() {
    this.orderConent.saveAndReceive();
  }
}
