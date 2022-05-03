import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SearchInventoryReportComponent } from 'src/app/components/search-inventory-report/search-inventory-report.component';
import { Product } from 'src/app/_classes/product.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

interface IData{
  product: string,
  outlet: string,
  current_stock: number,
  stock_value:number,
  item_value: number,
  reorder_point: number,
  reorder_amount: number
};

@Component({
  selector: 'app-inventory-reports',
  templateUrl: './inventory-reports.page.html',
  styleUrls: ['./inventory-reports.page.scss'],
})
export class InventoryReportsPage implements OnInit {
  title:string = 'Inventory History';
  user:any;
  util = UtilFunc;
  filteredData:Product[] = [];
  allData:Product[] = [];
  tableData:IData[] = [];
  loading: boolean = false;  
  
  filter = {
    product: '',    
    sort_field: 'product',
    sort_order: 'asc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'product', name: 'Product', sortable: true, checked: true},
    {prop: 'outlet', name: 'Outlet', sortable: true, checked: true},
    {prop: 'current_stock', name: 'Current Stock', sortable: true, checked: true},
    {prop: 'item_value', name: 'Item Value', sortable: true, checked: true},
    {prop: 'stock_value', name: 'Stock Value', sortable: true, checked: true},
    {prop: 'reorder_point', name: 'Reorder Point', sortable: true, checked: true},
    {prop: 'reorder_amount', name: 'Reorder Amunt', sortable: true, checked: true},
  ];
  show_columns:any[] = [2, 3, 4, 5, 7];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {        
      this.user = user;      
    });    
    this.search();  
  }

  search() {
    if(this.allData.length == 0) {
      this.loading = true;
      const filter = {tracking_inv: true};
      this.utilService.get('product/product', filter).subscribe(result => {            
        this.rows = []; this.tableData = [];
        if(result && result.body) {
          for(let p of result.body) {
            let product = new Product(this.authService, this.utilService);
            product.loadDetails(p);
            this.filteredData.push(product);
            this.allData.push(product);
          }
          this.getTableData();
        }        
        this.loading = false;
      })
    } else {
      this.doFilter();
    }   
  }

  doFilter() {
    this.loading = true;
    this.rows = []; this.tableData = []; this.filteredData = [];
    for(let s of this.allData) {
      let c = true;
      if(this.filter.product) {
        let keyword = this.filter.product.toLowerCase().trim();
        c = c && (s.data.name.toLowerCase().indexOf(keyword)>-1 || s.data.barcode.indexOf(keyword)>-1 || 
          (s.data.variant_inv && s.data.variant_products.filter(item => item.name.toLowerCase().indexOf(keyword)>-1).length>0));
      }      
      if(c) this.filteredData.push(s);
    }
    this.getTableData();
    this.loading = false;
  }

  getTableData() {
    for(let product of this.filteredData) {
      if(product.data.variant_inv) {
        for(let vp of product.data.variant_products) {
          let data:IData = {
            product: product.data.name + ' <small>' + vp.name + '</small>',
            outlet: product.data.outlet.name,
            current_stock: vp.inventory,                    
            item_value: vp.supply_price,
            stock_value: vp.inventory * vp.supply_price,
            reorder_point: vp.reorder_point,
            reorder_amount: vp.reorder_amount
          }          
          this.tableData.push(data);
        }
      } else {
        let data:IData = {
          product: product.data.name,
          outlet: product.data.outlet.name,
          current_stock: product.data.inventory,                    
          stock_value: product.data.inventory * product.data.supply_price,
          item_value: product.data.retail_price,
          reorder_point: product.data.reorder_point,
          reorder_amount: product.data.reorder_amount
        }          
        this.tableData.push(data);
      }    
    }
    this._onSort();
    this.getRowData();
  }

  getRowData() {
    this.rows = [];    
    for(let p of this.tableData) {      
      this.rows.push({
        product: p.product,
        outlet: p.outlet,
        current_stock: p.current_stock,
        stock_value: UtilFunc.getPriceWithCurrency(p.stock_value),
        item_value: UtilFunc.getPriceWithCurrency(p.item_value),
        reorder_point: p.reorder_point,
        reorder_amount: p.reorder_amount
      })    
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(['product', 'outlet'].includes(prop)) {
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

  async openSearch() {    
    const popover = await this.popoverController.create({
      component: SearchInventoryReportComponent,
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
