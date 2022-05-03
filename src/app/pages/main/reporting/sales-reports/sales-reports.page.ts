import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { UtilService } from 'src/app/_services/util.service';
import { PopoverController } from '@ionic/angular';
import { SearchSalesReportComponent } from 'src/app/components/search-sales-report/search-sales-report.component';

interface IData{
  date: string,  
  total: number,
  revenue: number,
  cost_of_goods: number,
  gross_profit: number,
  margin: number,
  tax: number
};

@Component({
  selector: 'app-sales-reports',
  templateUrl: './sales-reports.page.html',
  styleUrls: ['./sales-reports.page.scss'],
})
export class SalesReportsPage implements OnInit {
  title: string = 'Sales Reports';
  user:any;
  only_own_sales:boolean = false;
  util = UtilFunc;
  allData:any = [];
  tableData:IData[] = [];
  dates = [];
  loading: boolean = false;  

  filter = {
    outlet: '',
    user_id: '',
    start: '',
    end: '',
    sort_field: 'date',
    sort_order: 'desc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'date', name: 'Date', sortable: true, checked: true},
    {prop: 'total', name: 'Total(Incl. Tax)', sortable: true, checked: true},
    {prop: 'revenue', name: 'Revenue', sortable: true, checked: true},
    {prop: 'cost_of_goods', name: 'Cost of Goods', sortable: true, checked: true},
    {prop: 'gross_profit', name: 'Gross Profit', sortable: true, checked: true},
    {prop: 'margin', name: 'Margin(%)', sortable: true, checked: true},
    {prop: 'tax', name: 'Tax', sortable: true, checked: true},
  ];
  show_columns:any[] = [2, 3, 4, 5, 7];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) {
    this.authService.checkPremission('sales_report');        
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {        
      this.user = user; 
      if(user.role && user.role.name != 'Admin') {
        this.only_own_sales = user.role.permissions.includes('only_own_sales');
      }
      this.search();
    });    
  }

  search(){    
    if(this.user.outlet) this.filter.outlet = this.user.outlet._id;
    if(this.only_own_sales) {
      this.filter.user_id = this.user._id;
    }
    this.loading = true;
    if(this.allData.length == 0) {      
      this.utilService.get('sale/sale', this.filter).subscribe(result => {            
        this.rows = []; 
        if(result && result.body) {
          for(let s of result.body) {
            s.date = this.util.handleDate(s.created_at);
            let index = this.dates.findIndex(item=>item==s.date);
            if(index==-1) this.dates.push(s.date);
            this.allData.push(s);
          }
          this.getTableData();          
        }              
      })
    } else {
      this.getTableData();
    }    
  }

  getTableData() {
    this.tableData = [];
    for(let d of this.dates) {
      let c = true;
      if(this.filter.start) {
        c = c && UtilFunc.compareDate(d, this.filter.start)>=0;
      }
      if(this.filter.end) {
        c = c && UtilFunc.compareDate(d, this.filter.end)<=0;
      }
      if(!c) continue;
      let sData = this.allData.filter(item => item.date == d);
      let total = sData.reduce((a, b)=>a + b.total, 0);
      let revenue = sData.reduce((a, b)=>a + b.subtotal, 0);
      let tax = sData.reduce((a, b) => a + b.tax, 0);
      let cog = 0, margin = 0;
      for(let sd of sData) {
        for(let p of sd.products){
          if(p.variant_id !== '') {
            let v_index = p.product_id.variant_products.findIndex(item => item._id == p.variant_id);
            if(v_index > -1) {
              cog += p.product_id.variant_products[v_index].supply_price * p.qty;              
            }
          } else {
            cog += p.product_id.supply_price * p.qty;
            margin += p.product_id.margin;
          }
        }
      }
      let data = {
        date: d,
        total:total,
        revenue: revenue,
        cost_of_goods: cog,
        gross_profit: revenue - cog,
        margin: (cog!=0)?(revenue - cog)/cog * 100 : 0,
        tax: tax
      }
      this.tableData.push(data);      
    }
    this._onSort();
    this.getRowData();
    this.loading = false;
  }

  getRowData() {
    this.rows = [];
    for(let t of this.tableData) {
      this.rows.push({
        date: t.date,
        total: UtilFunc.getPriceWithCurrency(t.total),
        revenue: UtilFunc.getPriceWithCurrency(t.revenue),
        gross_profit: UtilFunc.getPriceWithCurrency(t.gross_profit),
        cost_of_goods: UtilFunc.getPriceWithCurrency(t.cost_of_goods),
        margin: t.margin.toFixed(2) + '%',
        tax: UtilFunc.getPriceWithCurrency(t.tax)
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(prop == 'date') {
        return UtilFunc.compareDate(a.date, b.date) * (dir === 'desc' ? -1 : 1);
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
      component: SearchSalesReportComponent,
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

  public get totalTotal(){
    let sum = this.tableData.reduce((a, b)=>a + b.total, 0);
    return this.util.getPriceWithCurrency(sum);
  }

  public get totalRevenue(){
    let sum = this.tableData.reduce((a, b)=>a + b.revenue, 0);
    return this.util.getPriceWithCurrency(sum);
  }

  public get totalCost(){
    let sum = this.tableData.reduce((a, b)=>a + b.cost_of_goods, 0);
    return this.util.getPriceWithCurrency(sum);
  }

  public get totalProfit(){
    let sum = this.tableData.reduce((a, b)=>a + b.gross_profit, 0);
    return this.util.getPriceWithCurrency(sum);
  }

  public get totalMargin(){    
    let sum = 0;
    let total_revenue = this.tableData.reduce((a, b)=>a + b.revenue, 0);
    let total_costs = this.tableData.reduce((a, b)=>a + b.cost_of_goods, 0);
    if(total_costs>0) sum = (total_revenue - total_costs) / total_costs * 100;    
    return sum.toFixed(2) + '%';
  }

  public get totalTax(){
    let sum = this.tableData.reduce((a, b)=>a + b.tax, 0);
    return this.util.getPriceWithCurrency(sum);
  }

  public get summary():any[] {
    return [
      {label: 'Total(Incl.Tax)', value: this.totalTotal},
      {label: 'Revenue', value: this.totalRevenue},
      {label: 'Cost of Goods', value: this.totalCost},
      {label: 'Gross Profit', value: this.totalProfit},
      {label: 'Margin(%)', value: this.totalMargin},
      {label: 'Tax', value: this.totalTax},
    ];
  }

}
