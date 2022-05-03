import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SearchStoreCreditComponent } from 'src/app/components/search-store-credit/search-store-credit.component';
import { Customer } from 'src/app/_classes/customer.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

interface IData{
  customer: string,
  issued: number,
  redeemed:number,
  credit: number,
  issued_str: string,
  redeemed_str:string,
  credit_str: string
}

@Component({
  selector: 'app-store-credit-reports',
  templateUrl: './store-credit-reports.page.html',
  styleUrls: ['./store-credit-reports.page.scss'],
})

export class StoreCreditReportsPage implements OnInit {
  title:string = 'Store Credit Reports';
  tableData:IData[] = [];
  allData: Customer[] = [];
  loading: boolean = false;

  filter = {
    customer: '',
    sort_field: 'customer',
    sort_order: 'asc'
  };
  rows:any[];  
  all_columns:any[] = [
    {prop: 'customer', name: 'Customer', sortable: true, checked: true},
    {prop: 'issued', name: 'Total Issued', sortable: true, checked: true},
    {prop: 'redeemed', name: 'Total Redeemed', sortable: true, checked: true},
    {prop: 'credit', name: 'Balance', sortable: true, checked: true}    
  ];
  show_columns:any[] = [2, 3, 4];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
   this.search(); 
  }

  search() {
    if(this.allData.length == 0) {
      this.loading = true;
      this.utilService.get('customers/customer',{}).subscribe(result => {
        if(result && result.body) {
          for(let c of result.body) {
            let customer = new Customer(this.authService, this.utilService);
            customer.loadDetails(c);          
            this.allData.push(customer);
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
    for(let customer of this.allData) {
      let c = true;
      if(this.filter.customer) {
        c = c && customer._id == this.filter.customer;
      }      
      if(!c) continue;
      let data:IData = {
        customer: customer.data.name + ' (' + customer.data.email + ')',
        issued: customer.data.total_issued,
        redeemed: customer.data.total_redeemed,
        credit: customer.data.credit,
        issued_str: customer.total_issued_str,
        redeemed_str: customer.total_redeemed_str,
        credit_str: customer.credit_str
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
        customer: t.customer,
        issued: t.issued_str,
        redeemed: t.redeemed_str,
        credit: t.credit_str
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(prop == 'customer') {
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
      component: SearchStoreCreditComponent,
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

  public get totalIssued(): string {
    let sum = this.tableData.reduce((a, b)=>a + b.issued, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalRedeemed(): string {
    let sum = this.tableData.reduce((a, b)=>a + b.redeemed, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get totalCredit(){
    let sum = this.tableData.reduce((a, b)=>a + b.credit, 0);
    return UtilFunc.getPriceWithCurrency(sum);
  }

  public get summary():any[] {
    return [
      {label: 'Total Issued', value: this.totalIssued},
      {label: 'Total Redeemed', value: this.totalRedeemed},
      {label: 'Balance', value: this.totalCredit} 
    ];
  }
  
}
