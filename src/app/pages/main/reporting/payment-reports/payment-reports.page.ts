import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SearchSalesReportComponent } from 'src/app/components/search-sales-report/search-sales-report.component';
import { Cart } from 'src/app/_classes/cart.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

interface IData{
  date: string,  
  store_credit: number,
  cash: number,
  concealed_cash: number,
  credit: number,
  debit: number,
  refunds: number,
  voided: number,
  total: number
};

@Component({
  selector: 'app-payment-reports',
  templateUrl: './payment-reports.page.html',
  styleUrls: ['./payment-reports.page.scss'],
})
export class PaymentReportsPage implements OnInit {
  title:string = 'Payment History';
  salesData:Cart[] = [];
  returnsData:Cart[] = [];
  voidedData:Cart[] = [];
  openClose:any[] = [];
  cashData:any = [];  
  dates = [];
  tableData:IData[] = [];
  loading: boolean = false;
  user:any;

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
    {prop: 'store_credit', name: 'Store Credit', sortable: true, checked: true},
    {prop: 'concealed_cash', name: 'Cash(concealed total)', sortable: true, checked: true},
    {prop: 'cash', name: 'Cash', sortable: true, checked: true},
    {prop: 'credit', name: 'Credit', sortable: true, checked: true},
    {prop: 'debit', name: 'Debit', sortable: true, checked: true},
    {prop: 'refunds', name: 'Refunds', sortable: true, checked: true},
    {prop: 'voided', name: 'voided', sortable: true, checked: true},
    {prop: 'total', name: 'Total', sortable: true, checked: true},
  ];
  show_columns:any[] = [2, 3, 4, 7, 9];

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
    const filter = {outlet: ''};
    if(this.user.outlet) filter.outlet = this.user.outlet._id; else delete filter.outlet;
    this.loading = true;
    if(this.salesData.length == 0) {      
      this.utilService.get('sale/payments', filter).subscribe(result => {
        this.rows = [];
        if(result && result.body) {                
          let date = '', index = 0;
          for(let c of result.body.sales) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(c);
            date = UtilFunc.handleDate(cart.created_at);
            index = this.dates.findIndex(item=>item==date);
            if(index==-1) this.dates.push(date);
            this.salesData.push(cart);
          }
          for(let r of result.body.returns) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(r);
            date = UtilFunc.handleDate(cart.created_at);
            index = this.dates.findIndex(item=>item==date);
            if(index==-1) this.dates.push(date);
            this.returnsData.push(cart);
          }
          for(let v of result.body.voided) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(v);
            date = UtilFunc.handleDate(cart.created_at);
            index = this.dates.findIndex(item=>item==date);
            if(index==-1) this.dates.push(date);
            this.voidedData.push(cart);
          }
          for(let o of result.body.openclose) {
            date = UtilFunc.handleDate(o.created_at);
            index = this.dates.findIndex(item=>item==date);
            if(index==-1) this.dates.push(date);
            this.openClose.push(o);
          }
          for(let c of result.body.cash) {
            date = UtilFunc.handleDate(c.created_at);
            index = this.dates.findIndex(item=>item==date);
            if(index==-1) this.dates.push(date);
            this.cashData.push(c);
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

      let sData = this.salesData.filter(item => UtilFunc.handleDate(item.created_at) == d);
      let rData = this.returnsData.filter(item => UtilFunc.handleDate(item.created_at) == d);
      let vData = this.voidedData.filter(item => UtilFunc.handleDate(item.created_at) == d);
      let oData = this.openClose.filter(item => UtilFunc.handleDate(item.created_at) == d);
      let cData = this.cashData.filter(item => UtilFunc.handleDate(item.created_at) == d);
      let refunds = rData.reduce((a, b)=> a + b.totalIncl, 0);    
      let voided = -1 * vData.reduce((a, b)=> a + b.tax + parseFloat(b.totalExcl), 0);      
      let cash = sData.reduce((a, b)=>a + b.getReceivedPayments('cash'), 0);
      let store_credit = sData.reduce((a, b)=>a + b.getReceivedPayments('store_credit'), 0);
      let debit = sData.reduce((a, b)=>a + b.getReceivedPayments('debit'), 0);
      let credit = sData.reduce((a, b)=>a + b.getReceivedPayments('credit'), 0);      
      for(let p of sData) {            
          if(p.sale_status == 'on_account') {                
              credit += p.tax + parseFloat(p.totalExcl);
          }
      }
      let ccash = oData.reduce((a, b)=>a + b.open_value, 0);
      for(let c of cData) {
        if(c.is_credit == 1) {
          ccash += c.transaction;
        } else {
          ccash -= c.transaction;
        }
      }
      let data:IData = {
        date: d,
        cash: cash,
        store_credit: store_credit,
        debit: debit,
        refunds: refunds,
        voided: voided,
        credit: credit,
        concealed_cash: ccash,
        total: cash + credit + ccash + refunds + debit + store_credit + voided
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
        cash: UtilFunc.getPriceWithCurrency(t.cash),
        store_credit: UtilFunc.getPriceWithCurrency(t.store_credit),
        debit: UtilFunc.getPriceWithCurrency(t.debit),
        refunds: UtilFunc.getPriceWithCurrency(t.refunds),
        voided: UtilFunc.getPriceWithCurrency(t.voided),
        credit: UtilFunc.getPriceWithCurrency(t.credit),
        concealed_cash: UtilFunc.getPriceWithCurrency(t.concealed_cash),
        total: UtilFunc.getPriceWithCurrency(t.total)
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

  
  public get totalCash():string{
    let sum = this.tableData.reduce((a, b)=>a + b.cash, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalConceled(){
    let sum = this.tableData.reduce((a, b)=>a + b.concealed_cash, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalCreditCard(){
    let sum = this.tableData.reduce((a, b)=>a + b.credit, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalDebitCard(){
    let sum = this.tableData.reduce((a, b)=>a + b.debit, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalRefunds(){
    let sum = this.tableData.reduce((a, b)=>a + b.refunds, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalVoided(){
    let sum = this.tableData.reduce((a, b)=>a + b.voided, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalStoreCredit(){
    let sum = this.tableData.reduce((a, b)=>a + b.store_credit, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get totalTotal(){
    let sum = this.tableData.reduce((a, b)=>a + b.total, 0);
    return UtilFunc.getPriceWithCurrency(sum);    
  }

  public get summary():any[] {
    return [
      {label: 'Store Credit', value: this.totalStoreCredit},
      {label: 'Cash(concealed total)', value: this.totalConceled},
      {label: 'Cash', value: this.totalCash},
      {label: 'Credit', value: this.totalCreditCard},
      {label: 'Debit', value: this.totalDebitCard},
      {label: 'Refunds', value: this.totalRefunds},
      {label: 'Voided', value: this.totalVoided},
      {label: 'Total', value: this.totalTotal},
    ];
  }

}
