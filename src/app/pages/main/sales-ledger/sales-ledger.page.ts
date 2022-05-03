import { Component, OnInit } from '@angular/core';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import { PopoverController } from '@ionic/angular';
import { SearchSalesLedgerComponent } from 'src/app/components/search-sales-ledger/search-sales-ledger.component';
import { IPage } from 'src/app/components/table/table.component';
import { SaleDataSource } from 'src/app/_datasource/sale.datasource';
import { Cart } from 'src/app/_classes/cart.class';

interface IData{
  created_at: string,  
  user_id: string,
  register: string,
  sale_number: string,
  customer: string,
  sale_status: string,
  total: string
};

@Component({
  selector: 'app-sales-ledger',
  templateUrl: './sales-ledger.page.html',
  styleUrls: ['./sales-ledger.page.scss'],
})
export class SalesLedgerPage implements OnInit {
  title:string = 'Sales Ledger';
  util = UtilFunc;  
  statuses = [];

  filter = {
    customer: '',
    sale_status: 'all_payments',
    outlet:'',
    user_id: '',
    start:'',
    end:'',
    sort_field: 'created_at',
    sort_order: -1
  };    
  dataSource: SaleDataSource;    
  page: IPage;

  summary:any[] = [];
  rows:IData[];
  all_columns:any[] = [
    {prop: 'created_at', name: 'Date', sortable: true, checked: true},
    {prop: 'user_id', name: 'User', sortable: true, checked: true},
    {prop: 'register', name: 'Register', sortable: true, checked: true},
    {prop: 'sale_number', name: 'Receipt', sortable: true, checked: true},
    {prop: 'customer', name: 'Customer', sortable: true, checked: true},
    {prop: 'sale_status', name: 'Status', sortable: true, checked: true},
    {prop: 'total', name: 'Total', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 3, 4, 5, 7];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController,
  ) {
    this.dataSource = new SaleDataSource(this.authService, this.utilService);
    this.page = {totalElements: 0, pageNumber: 0};
    this.authService.checkPremission('sales_ledger');
  }

  ngOnInit() {
    this.search();        
  }

  public get loading():boolean {
    return this.dataSource.loading;
  }

  search(){                
		let size = 10;    
    this.dataSource.loadCarts(this.filter, this.page.pageNumber, size, data => {
      this.page.totalElements = this.dataSource.totalElements;            
      this.summary = [{label: 'Total', value: UtilFunc.getPriceWithCurrency(this.dataSource.totalSum)}];
      this.rows = [];
      for(let s of data) {
        this.rows.push(this.getRowData(s));
      }
    });
  }

  getRowData(cart:Cart) {         
    let data:IData = {
      created_at: '<span>' + this.util.handleDate(cart.created_at) + '</span><small>' + this.util.handleTime(cart.created_at) + '</small>',
      user_id: '<span>' + cart.user.first_name + ' ' + cart.user.last_name + '</span><small>' + cart.user.email + '</small>',      
      sale_number: '#' + cart.sale_number,
      register: cart.register_obj? cart.register_obj.name : '-',
      total: cart.totalIncl_str,
      customer: '',
      sale_status: cart.status_label
    };    
    if(cart.customer) {
      data.customer = '<span>' + cart.customer.data.name + '</span>';
      if(cart.customer.data.email) data.customer += '<small>' + cart.customer.data.email + '</small>';
    }
    return data;
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchSalesLedgerComponent,
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

  onSort(sort:any) {    
    setTimeout(() => {
      this.filter.sort_field = sort.prop;
      this.filter.sort_order = (sort.dir === 'desc' ? -1 : 1);
      this.search();
    }, 200);
  }

  onPage(offset) {
    this.page.pageNumber = offset;
    this.search();
  }
}
