import { Component, OnInit } from '@angular/core';
import { IPage } from 'src/app/components/table/table.component';
import { SaleDataSource } from 'src/app/_datasource/sale.datasource';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { Cart } from 'src/app/_classes/cart.class';
import { PopoverController } from '@ionic/angular';
import { ToastService } from 'src/app/_services/toast.service';
import { SearchSaleComponent } from 'src/app/components/search-sale/search-sale.component';
import { SaleDetailComponent } from 'src/app/components/sale-detail/sale-detail.component';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-quoted-sales',
  templateUrl: './quoted-sales.page.html',
  styleUrls: ['./quoted-sales.page.scss'],
})
export class QuotedSalesPage implements OnInit {
  title: string = 'Quoted Sales';
  util = UtilFunc;

  filter = {
    customer: '',
    sale_status: 'quoted',
    outlet:'',
    user_id: '',
    start:'',
    end:'',
    note: '',
    voided: 'all',
    sale_number: '',
    sort_field: 'created_at',
    sort_order: -1
  };  
  sort = {
    field: 'created_at',
    dir: -1
  }
  dataSource: SaleDataSource;    
  page: IPage;

  rows:any[];
  all_columns:any[] = [
    {prop: 'created_at', name: 'Date', sortable: true, checked: true},
    {prop: 'sale_number', name: 'Receipt', sortable: true, checked: true},
    {prop: 'customer', name: 'Customer', sortable: true, checked: true},
    {prop: 'user_id', name: 'User', sortable: true, checked: true},
    {prop: 'note', name: 'Note', sortable: true, checked: true},
    {prop: 'total', name: 'Total', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 3, 4, 5, 6];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController,
    private toastService: ToastService
  ) {
    this.dataSource = new SaleDataSource(this.authService, this.utilService);
    this.page = {totalElements: 0, pageNumber: 0};
    this.authService.checkPremission('quoted');
  }

  ngOnInit() {
    this.search();
  }

  search() {
    let size = 10;    
    this.dataSource.loadCarts(this.filter, this.page.pageNumber, size, data => {
      this.page.totalElements = this.dataSource.totalElements;                  
      this.rows = [];
      for(let s of data) {
        this.rows.push(this.getRowData(s));
      }
    });
  }

  public get loading():boolean {
    return this.dataSource.loading;
  }

  getRowData(sale:Cart) {         
    let data = {
      cart: sale,
      created_at: '<span>' + UtilFunc.handleDate(sale.created_at) + '</span><small>' + UtilFunc.handleTime(sale.created_at) + '</small>',
      sale_number: '#' + sale.sale_number,
      customer: '-',
      user_id: '<span>' + sale.user.first_name + ' ' + sale.user.last_name + '</span><small>' + sale.user.email + '</small>',      
      note: sale.note ? sale.note : '-',
      total: sale.totalIncl_str
    };    
    if(sale.customer) {
      data.customer = '<span>' + sale.customer.data.name + '</span>';
      if(sale.customer.data.email) data.customer += '<small>' + sale.customer.data.email + '</small>';
    }
    return data;
  }

  async openSearch() {    
    const popover = await this.popoverController.create({
      component: SearchSaleComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {filter: this.filter, default_sale_status: 'quoted'}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.filter) {
          for(let key in data.filter) {
            if(key != 'sale_status') this.filter[key] = data.filter[key];
          }
          this.search();
        }
      }
    });

    await popover.present(); 
  }

  async openDetail(row) {
    let cart:Cart = row.cart;    
    const popover = await this.popoverController.create({
      component: SaleDetailComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {cart: cart}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined' && result.data.action) {        
        let data = result.data;
        if(data.action == 'view_origin') {
          this.filter.sale_number = data.sale_number;
          this.search();
        } else if(data.action == 'void_sale') {
          data.sale.voidSale(() => {
            this.toastService.show(Constants.message.successVoided);
            this.search();
          })
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
