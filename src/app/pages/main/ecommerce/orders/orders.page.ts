import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { Onlineorder } from 'src/app/_classes/onlineorder.class';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { OnlineOrderService } from 'src/app/_services/online-order.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { SearchOnlineOrderComponent } from 'src/app/components/search-online-order/search-online-order.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdersPage implements OnInit {
  title:string = 'Orders';

  allData:Onlineorder[] = [];
  tableData = [];
  loading: boolean = false;

  filter = {
    keyword: '',
    status: '',
    payment_status: '',
    customer: '',
    start: '',
    end: '',
    sort_field: 'created_at',
    sort_order: 'desc'
  };  
  rows:any[];  
  all_columns:any[] = [
    {prop: 'reference', name: 'Reference', sortable: true, checked: true},
    {prop: 'customer', name: 'customer', sortable: true, checked: true},
    {prop: 'total', name: 'Total', sortable: true, checked: true},
    {prop: 'payment', name: 'Payment', sortable: true, checked: true},
    {prop: 'status', name: 'Status', sortable: true, checked: true},
    {prop: 'payment_status', name: 'Payment Status', sortable: true, checked: true},    
    {prop: 'created_at', name: 'Created', sortable: true, checked: true},

  ];
  show_columns:any[] = [2, 3, 5, 7];

  constructor(
    private onlineOrderService: OnlineOrderService,
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private popoverController: PopoverController,
    private nav: NavController
  ) { }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.onlineOrderService.changed) {
      this.initTable();
      this.onlineOrderService.changed = false;
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('sale/order', {}).subscribe(result => {
      if(result && result.body) {
        for(let r of result.body) {
          const order = new Onlineorder(this.authService, this.utilService);
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
        c = c && (a.reference && a.reference.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1 || 
              a.note && a.note.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(this.filter.status) {
        c = c && (a.status == this.filter.status);
      }
      if(this.filter.payment_status) {
        c = c && (a.payment_status == this.filter.payment_status)
      }
      if(this.filter.customer) {
        let keyword = this.filter.customer;
        c = c && (a.customer && (a.customer.name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1 || 
              a.customer.email.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1))
      }
      if(this.filter.start) {
        c = c && UtilFunc.compareDate(a.created_at, this.filter.start) >= 0;
      }
      if(this.filter.end) {
        c = c && UtilFunc.compareDate(a.created_at, this.filter.end) <= 0;
      }      
      if(!c) continue;            
      this.tableData.push({
        _id: a._id,
        reference: a.reference,
        customer: a.customer?a.customer.name:'',
        email: a.customer?a.customer.email:'',
        total: a.totalIncl,
        total_str: a.totalIncl_str,
        payment: a.payment_type,
        status: a.status,
        status_str: a.status_str,
        payment_status: a.payment_status,        
        payment_status_str: a.payment_status_str,
        created_at: a.created_at,
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
        reference: t.reference,
        customer: t.customer + ' <small>' + t.email + '</small>',
        total: t.total_str,
        payment: t.payment,
        status: '<span class="status ' + t.status + '">' + t.status_str + '</span>',
        payment_status: '<span class="status ' + t.payment_status + '">' + t.payment_status_str + '</span>',
        created_at: UtilFunc.handleDate(t.created_at) + ' <small>' + UtilFunc.handleTime(t.created_at) + '</small>',
        order: t.order
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if('total' == prop) {
        return (a[prop] - b[prop]) * (dir === 'desc' ? -1 : 1);
      }else if(prop == 'created_at') {
        return UtilFunc.compareDate(a.created_at, b.created_at) * (dir === 'desc' ? -1 : 1);        
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

  edit(row:any) {    
    this.onlineOrderService.init(row._id, () => {
      this.nav.navigateForward(['online-order-detail']);    
    });    
  }

  delete(row:any) {
    let order:Onlineorder = row.order;
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this order?', () => {
      order.delete(() => {
        this.initTable();
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchOnlineOrderComponent,
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

}
