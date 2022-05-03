import { Component, OnInit, ViewChild } from '@angular/core';
import { EditOrderStockContentComponent } from 'src/app/components/edit-order-stock-content/edit-order-stock-content.component';
import { OrderService } from 'src/app/_services/order.service';

@Component({
  selector: 'app-return-stock',
  templateUrl: './return-stock.page.html',
  styleUrls: ['./return-stock.page.scss'],
})
export class ReturnStockPage implements OnInit {
  title:string = 'Add Stock Return';
  @ViewChild('orderContent') orderConent: EditOrderStockContentComponent;

  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.orderService.init();
    this.orderService.order.data.type = 'return';
  }

  submit() {
    this.orderService.order.data.status = 'returned';
    this.orderConent.submit();
  }

}
