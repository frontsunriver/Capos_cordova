import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { SearchRegisterClosureComponent } from 'src/app/components/search-register-closure/search-register-closure.component';
import { Openclose } from 'src/app/_classes/openclose.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

interface IData{
  _id: string,
  register: string,
  opening_time: string,
  closing_time: string,
  store_credit: number,
  cash_concealed: number,
  cash: number,
  credit: number,  
  debit: number,
  refunds: number,  
  voided: number,
  total: number
};

@Component({
  selector: 'app-register-closures',
  templateUrl: './register-closures.page.html',
  styleUrls: ['./register-closures.page.scss'],
})
export class RegisterClosuresPage implements OnInit {
  title:string = 'Register Closures';
  user:any;
  allData:Openclose[] = [];
  tableData:IData[] = [];
  loading: boolean = false;

  filter = {
    register: '',
    start: '',
    end: '',
    sort_field: 'opening_time',
    sort_order: 'desc'
  };
  rows:any[];  
  all_columns:any[] = [
    {prop: 'register', name: 'Register', sortable: true, checked: true},
    {prop: 'opening_time', name: 'Time Opened', sortable: true, checked: true},
    {prop: 'closing_time', name: 'Time Closed', sortable: true, checked: true},
    {prop: 'store_credit', name: 'Store Credit', sortable: true, checked: true},
    {prop: 'cash_concealed', name: 'Cash(concealed total)', sortable: true, checked: true},
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
    private popoverController: PopoverController,
    private nav: NavController
  ) {    
    this.authService.checkPremission('regiser_closure');
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.search();
    })
  }

  search() {
    this.loading = true;
    if(this.allData.length == 0) {
      const filter = {outlet: '', status: 2};
      if(this.user.outlet) filter.outlet = this.user.outlet._id; else delete filter.outlet;
      this.utilService.get('sell/openclose', filter).subscribe(result => {            
        if(result && result.body) {
          for(let s of result.body) {
            let openClose = new Openclose(this.authService, this.utilService);   
            openClose.loadDetails(s);                    
            this.allData.push(openClose);          
          }
        }  
        this.getTableData();    
      })
    } else {
      this.getTableData();
    }
  }

  getTableData() {
    this.tableData = [];
    for(let openClose of this.allData) {
      let c = true;
      if(this.filter.start) {
        c = c && UtilFunc.compareDate(openClose.opening_time, this.filter.start)>=0;
      }
      if(this.filter.end) {
        c = c && UtilFunc.compareDate(openClose.opening_time, this.filter.end)<=0;
      }
      if(this.filter.register) {
        c = c && openClose.register._id == this.filter.register;
      }
      if(!c) continue;
      let data:IData = {
        _id: openClose._id,
        register: openClose.register.name,        
        opening_time: openClose.opening_time,
        closing_time: openClose.closing_time,
        store_credit: parseFloat(openClose.receivedStoreCredit),
        cash: parseFloat(openClose.receivedCash),
        cash_concealed: parseFloat(openClose.totalCashMovements),
        credit: parseFloat(openClose.receivedCreditCard),
        debit: parseFloat(openClose.receivedDebitCard),
        refunds: parseFloat(openClose.totalReturns),
        voided: parseFloat(openClose.totalVoided),
        total: parseFloat(openClose.totalExpected)
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
        _id: t._id,
        register: t.register,
        opening_time: UtilFunc.handleDate(t.opening_time) + ' <small>' + UtilFunc.handleTime(t.opening_time) + '</small>',
        closing_time: UtilFunc.handleDate(t.closing_time) + ' <small>' + UtilFunc.handleTime(t.closing_time) + '</small>',
        store_credit: UtilFunc.getPriceWithCurrency(t.store_credit),
        cash: UtilFunc.getPriceWithCurrency(t.cash),
        cash_concealed: UtilFunc.getPriceWithCurrency(t.cash_concealed),
        credit: UtilFunc.getPriceWithCurrency(t.credit),
        debit: UtilFunc.getPriceWithCurrency(t.debit),
        refunds: UtilFunc.getPriceWithCurrency(t.refunds),
        voided: UtilFunc.getPriceWithCurrency(t.voided),
        total: UtilFunc.getPriceWithCurrency(t.total)
      });
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(['opening_time', 'closing_time'].includes(prop)) {
        return UtilFunc.compareDate(a[prop], b[prop]) * (dir === 'desc' ? -1 : 1);
      } else if(prop == 'register') {
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
      component: SearchRegisterClosureComponent,
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

  showDetail(row:any) {
    let _id = row._id;
    this.nav.navigateForward(['register-detail'], {queryParams: {_id: _id}});
  }

  public get totalStoreCredit():string {
    let sum = this.tableData.reduce((a, b)=>a + b.store_credit, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalCash():string {
    let sum = this.tableData.reduce((a, b)=>a + b.cash, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalConcealedTotal():string {
    let sum = this.tableData.reduce((a, b)=>a + b.cash_concealed, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalCreditCard():string {
    let sum = this.tableData.reduce((a, b)=>a + b.credit, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalDebitCard():string {
    let sum = this.tableData.reduce((a, b)=>a + b.debit, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalRefunds():string {
    let sum = this.tableData.reduce((a, b)=>a + b.refunds, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalVoided():string {
    let sum = this.tableData.reduce((a, b)=>a + b.voided, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalTotal():string {
    let sum = this.tableData.reduce((a, b)=>a + b.total, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get summary():any[] {
    return [
      {label: 'Store Credit', value: this.totalStoreCredit},
      {label: 'Cash(concealed total)', value: this.totalConcealedTotal},
      {label: 'Cash', value: this.totalCash},
      {label: 'Credit', value: this.totalCreditCard},
      {label: 'Debit', value: this.totalDebitCard},
      {label: 'Refunds', value: this.totalRefunds},
      {label: 'Voided', value: this.totalVoided},
      {label: 'Total', value: this.totalTotal},
    ];
  }
}
