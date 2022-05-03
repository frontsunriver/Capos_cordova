import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { Customer } from 'src/app/_classes/customer.class';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { ThisReceiver } from '@angular/compiler';
import { Constants } from 'src/app/_configs/constants';
import { SearchCustomerComponent } from 'src/app/components/search-customer/search-customer.component';
import { EditCustomerComponent } from 'src/app/components/edit-customer/edit-customer.component';
import { CustomerService } from 'src/app/_services/customer.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
})
export class CustomersPage implements OnInit {

  title: string = 'Customers';
  allData:Customer[] = [];
  tableData = [];
  loading: boolean = false;
  permission:boolean = false;
  user: any;

  filter = {
    keyword: '',    
    group: '',
    sort_field: 'name',
    sort_order: 'asc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'email', name: 'Email', sortable: true, checked: true},
    {prop: 'group', name: 'Group', sortable: true, checked: true},
    {prop: 'store_credit', name: 'Store Credit', sortable: true, checked: true},
    {prop: 'balance', name: 'Balance', sortable: true, checked: true},
    {prop: 'point', name: 'Point', sortable: true, checked: true},
  ];
  show_columns:any[] = [3, 4, 6];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController,
    private customerService: CustomerService,
    private nav: NavController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('add_customer') && this.user.role.permissions.includes('remove_customer');        
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.customerService.changed) {
      this.initTable();
      this.customerService.changed = false;
      this.customerService.init();
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('customers/customer', {}).subscribe(result => {
      for(let r of result.body) {
        const c = new Customer(this.authService, this.utilService);
        c.loadDetails(r);      
        this.allData.push(c);
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
        c = c && (a.data.name && a.data.name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(this.filter.group) {
        c = c && (a.data.groupId && a.data.groupId._id == this.filter.group);
      }
      if(!c) continue;
      this.tableData.push({
        _id: a._id,
        name: a.data.name,
        email: a.data.email,
        group: a.data.groupId ? a.data.groupId.name : '',
        store_credit: a.data.credit,
        balance: a.balance,
        point: a.data.point,
        customer: a
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
        name: t.name,
        email: t.email,
        group: t.group,
        store_credit: UtilFunc.getPriceWithCurrency(t.store_credit),
        balance: UtilFunc.getPriceWithCurrency(t.balance),
        point: UtilFunc.getPriceWithCurrency(t.point),
        customer: t.customer
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(['name', 'email', 'group'].includes(prop)) {
        return a[prop].localeCompare(b[prop]) * (dir === 'desc' ? -1 : 1);
      } else {
        return (a[prop] - b[prop]) * (dir === 'desc' ? -1 : 1);
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
    this.customerService.init();
    this.nav.navigateForward(['edit-customer']);    
  }

  edit(row:any) {
    this.customerService.init(row.customer.data);
    this.nav.navigateForward(['edit-customer']);
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this customer?', () => {
      this.utilService.delete('customers/customer?_id=' + row._id).subscribe(result => {
        this.initTable();
      }, async error => {
        this.toastService.show(Constants.message.failedRemove)
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchCustomerComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
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
