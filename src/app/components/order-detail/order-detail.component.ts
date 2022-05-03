import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/_classes/order.class';
import { OrderService } from 'src/app/_services/order.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {  
  util = UtilFunc;
  title:string = 'Order Detail';
  loading:boolean = false;

  rows:any[];  
  all_columns:any[] = [
    {prop: 'name', name: 'Product', sortable: true, checked: true},
    {prop: 'sku', name: 'SKU', sortable: true, checked: true},
    {prop: 'supplier_code', name: 'Supplier Code', sortable: true, checked: true},
    {prop: 'stock', name: 'Stock', sortable: true, checked: true},
    {prop: 'qty', name: 'Ordered', sortable: true, checked: true},
    {prop: 'supply_price', name: 'Supply Cost', sortable: true, checked: true},
    {prop: 'total_supply', name: 'Total Supply Cost', sortable: true, checked: true},
    {prop: 'retail_price', name: 'Retail Price', sortable: true, checked: true},
    {prop: 'total_price', name: 'Total Retail Price', sortable: true, checked: true},
  ];
  show_columns:any[] = [2, 3, 5, 7, 9];

  constructor(
    private orderService: OrderService,
    private nav: NavController
  ) { }

  ngOnInit() {
    if(!this.order._id) {
      this.nav.back();
    } 
  }

  ionViewDidEnter() {
    if(this.order._id) {
      if(this.order.data.type=='purchase' && this.order.data.status=='open') {
        this.order.data.status = 'Ordered';
      } else if(this.order.data.status=='received') {
        this.order.data.status = 'Returned';
      } else if(this.order.data.status == 'returned') {
        this.order.data.status = 'Returned';
      }
      this.loading = true;
      this.rows = [];
      for(let p of this.order.data.products) {
        const data = {
          name: p.product_name + '<small>' + p.variant_name + '</small>',
          sku: p.product.data.sku,
          supplier_code: p.product.data.supplier_code,
          stock: Order.getProductInventory(p),
          qty: p.qty,
          supply_price: UtilFunc.getPriceWithCurrency(p.supply_price),
          total_supply: this.order.getProductTotal_str(p),
          retail_price: this.order.getProductRetailPrice(p),
          total_price: this.order.getProductRetailTotal(p)
        }
        this.rows.push(data);
      }
      this.loading = false;
    }
  }

  public get order():Order {
    return this.orderService.order;
  }

}
