import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { SearchOrderStockComponent } from 'src/app/components/search-order-stock/search-order-stock.component';
import { Order } from 'src/app/_classes/order.class';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { OrderService } from 'src/app/_services/order.service';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.page.html',
  styleUrls: ['./manage-orders.page.scss'],
})
export class ManageOrdersPage implements OnInit {
  title: string = 'Manage Orders';   
  allData:Order[] = [];
  tableData = [];
  loading: boolean = false;

  filter = {
    keyword: '',
    type: '',
    outlet: '',
    supplier: '',
    date_from: '',
    date_to: '',
    due_from: '',
    due_to: '',
    sort_field: 'created_at',
    sort_order: 'desc'
  };  
  rows:any[];  
  all_columns:any[] = [
    {prop: 'type', name: 'Type', sortable: true, checked: true},
    {prop: 'number', name: 'Number', sortable: true, checked: true},
    {prop: 'from', name: 'From', sortable: true, checked: true},
    {prop: 'to', name: 'To', sortable: true, checked: true},
    {prop: 'status', name: 'Status', sortable: true, checked: true},
    {prop: 'items', name: 'Items', sortable: true, checked: true},
    {prop: 'cost', name: 'Cost', sortable: true, checked: true},
    {prop: 'created_at', name: 'Created At', sortable: true, checked: true},
  ];
  show_columns:any[] = [2, 3, 4, 5, 8];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private orderService: OrderService,
    private popoverController: PopoverController,
    private nav: NavController
  ) { }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.orderService.changed) {
      this.initTable();
      this.orderService.changed = false;
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('product/order', {field: 'all-factor'}).subscribe(result => {
      if(result && result.body) {
        for(let r of result.body) {
          const order = new Order(this.authService, this.utilService);
          order.loadDetails(r);      
          this.allData.push(order);
        }
      }
      this.getTableData();
    });
  }

  search() {
    this.loading = true;
    if(this.allData.length == 0) {      
      this.initTable()      
    } else {
      this.getTableData();
    }    
  }
  
  getTableData() {
    this.tableData = [];
    for(let a of this.allData) {
      let c = true;
      if(this.filter.keyword) {
        let keyword = this.filter.keyword;
        c = c && (a.data.invoice_number && a.data.invoice_number.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1 || 
              a.data.order_number && a.data.order_number.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(this.filter.type) {
        c = c && (a.data.type && a.data.type == this.filter.type);
      }
      if(this.filter.outlet) {
        c = c && (a.data.deliver_to && a.data.deliver_to._id == this.filter.outlet)
      }
      if(this.filter.supplier) {
        c = c && (a.data.supplier && a.data.supplier._id == this.filter.supplier)
      }
      if(this.filter.date_from) {
        c = c && UtilFunc.compareDate(a.data.created_at, this.filter.date_from) >= 0;
      }
      if(this.filter.date_to) {
        c = c && UtilFunc.compareDate(a.data.created_at, this.filter.date_to) <= 0;
      }
      if(this.filter.due_from) {
        c = c && UtilFunc.compareDate(a.data.delivery_date, this.filter.due_from) >= 0;
      }
      if(this.filter.due_to) {
        c = c && UtilFunc.compareDate(a.data.delivery_date, this.filter.due_to) <= 0;
      }
      if(!c) continue;      
      let from = a.data.type=='return' ? a.data.deliver_to.name : a.data.supplier.name;
      let to = a.data.type!=='return' ? a.data.deliver_to.name : a.data.supplier.name;
      this.tableData.push({
        _id: a._id,
        type: UtilFunc.toUppercase(a.data.type),
        number: a.data.order_number,
        number_str: a.data.order_number + ' <small>Supplier: ' + a.data.type + '</small>',
        from: from,
        from_str: from + (a.data.order_number ? ' <small>Invoice:' + a.data.invoice_number + '</small>':''),
        to: to,
        to_str: to + (a.data.delivery_date ? ' <small>Due:' + UtilFunc.handleDate(a.data.delivery_date) + '</small>':''),
        status: a.status,
        items: a.items,
        cost: a.total,
        cost_str: a.total_str,
        created_at: UtilFunc.handleDate(a.data.created_at),
        order: a
      })
    }
    this._onSort();
    this.getRowData();
    this.loading = false;
  }

  getRowData() {
    this.rows = [];
    for(let t of this.tableData) {
      this.rows.push({
        _id: t._id,
        type: t.type,
        number: t.number_str,
        from: t.from_str,
        to: t.to_str,
        status: t.status,
        items: t.items,
        cost: t.cost_str,
        created_at: t.created_at,
        order: t.order        
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(['items', 'cost'].includes(prop)) {
        return (a[prop] - b[prop]) * (dir === 'desc' ? -1 : 1);
      }else if(prop == 'created_at') {
        return UtilFunc.compareDate(a.date, b.date) * (dir === 'desc' ? -1 : 1);        
      } else {
        return a[prop].localeCompare(b[prop]) * (dir === 'desc' ? -1 : 1);
      }        
    })
    this.tableData = tableData;
  }

  onSort(sort:any) {    
    this.loading = true;
    this.filter.sort_field = sort.prop;
    this.filter.sort_order = sort.dir;
    setTimeout(() => {
      this._onSort();
      this.getRowData();
      this.loading = false;
    }, 200);
  }

  addNew() {    
    this.orderService.init();
    this.nav.navigateForward(['edit-order-stock']);    
  }

  edit(row:any) {
    let order:Order = row.order;    
    this.orderService.init();
    this.orderService.order = order;
    if(order.data.status == 'open') {      
      this.nav.navigateForward(['edit-order-stock']);    
    } else {
      this.nav.navigateForward(['order-detail']);    
    }
  }

  delete(row:any) {
    let order:Order = row.order;
    if(order.data.status == 'open') {
      this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this order?', () => {
        order.delete(() => {
          this.initTable();
        })
      })
    }
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchOrderStockComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {filter: this.filter}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.filter) {
          for(let key in data.filter) {
            this.filter[key] = data.filter[key];
          }
          this.search();
        }
      }
    });

    await popover.present(); 
  }

  goto(url:string) {
    this.nav.navigateForward(['main/stock-control/' + url]);
  }

  public get totalItems():number {
    return this.tableData.reduce((a, b) => a + b.items, 0)
  }

  public get totalCost():string {
    let sum = this.tableData.reduce((a, b) => a + b.cost, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get summary():any[] {
    return [
      {label: 'Total Items', value: this.totalItems},
      {label: 'Total Cost', value: this.totalCost}
    ]
  }

}
