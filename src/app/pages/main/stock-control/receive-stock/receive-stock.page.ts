import { Component, OnInit, ViewChild } from '@angular/core';
import { EditOrderStockContentComponent } from 'src/app/components/edit-order-stock-content/edit-order-stock-content.component';
import { OrderService } from 'src/app/_services/order.service';

@Component({
  selector: 'app-receive-stock',
  templateUrl: './receive-stock.page.html',
  styleUrls: ['./receive-stock.page.scss'],
})
export class ReceiveStockPage implements OnInit {
  title:string = 'Add Receive Stock';
  @ViewChild('orderContent') orderConent: EditOrderStockContentComponent;

  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.orderService.init();
    this.orderService.order.data.type = 'receive';
  }

  submit() {
    this.orderService.order.data.status = 'received';
    this.orderConent.submit();
  }

}
