import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import { ToastService } from 'src/app/_services/toast.service';
import { AlertService } from 'src/app/_services/alert.service';
import { Constants } from 'src/app/_configs/constants';
import { PopoverController } from '@ionic/angular';
import { EditCashComponent } from 'src/app/components/edit-cash/edit-cash.component';
import { SearchCashComponent } from 'src/app/components/search-cash/search-cash.component';
import { CashDataSource } from 'src/app/_datasource/cash.datasource';
import { IPage } from 'src/app/components/table/table.component';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-cash-management',
  templateUrl: './cash-management.page.html',
  styleUrls: ['./cash-management.page.scss'],
})
export class CashManagementPage implements OnInit {
  title:string = 'Cash Management';
  user:any;
  main_outlet:any;
  row_data = [];
  
  filter = {
    outlet:'',
    register: '',
    user_id: '',
    start:'',
    end:'',
    is_main: '',
    sort_field: 'created_at',
    sort_order: -1
  };  
  sort = {
    field: 'created_at',
    dir: -1
  }
  dataSource: CashDataSource;    
  page: IPage;

  rows:any[];
  all_columns:any[] = [
    {prop: 'created_at', name: 'Date', sortable: true, checked: true},
    {prop: 'user_id', name: 'User', sortable: true, checked: true},
    {prop: 'register', name: 'Register', sortable: true, checked: true},
    {prop: 'reasons', name: 'Reasons', sortable: true, checked: true},
    {prop: 'is_credit', name: 'Type', sortable: true, checked: true},
    {prop: 'transaction', name: 'Transaction', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 3, 4, 6];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private toastService: ToastService,
    private alertService: AlertService,
    private popoverController: PopoverController
  ) {
    this.dataSource = new CashDataSource(this.utilService);
    this.page = {totalElements: 0, pageNumber: 0};

    this.authService.checkPremission('cash_management');
    this.authService.currentUser.subscribe(user => {
      this.user = user;      
    });
    this.utilService.get('sell/outlet', {is_main: true}).subscribe(result => {
      if(result && result.body) {
        this.main_outlet = result.body[0];
      }
    })
  }

  ngOnInit() {
    this.search();
  }

  public get loading():boolean {
    return this.dataSource.loading;
  }

  search() {    
    let size = 10;    
    if(this.user.outlet) {
      this.filter.outlet = this.user.outlet._id;
      this.filter.register = this.user.outlet.register[0];
    } else if(this.main_outlet) {
      this.filter.outlet = this.main_outlet._id;
      this.filter.register = this.main_outlet.register[0];
    } 
    this.dataSource.load(this.filter, this.page.pageNumber, size, data => {
      this.page.totalElements = this.dataSource.totalElements;                  
      this.rows = []; this.row_data = [];
      for(let s of data) {
        this.rows.push(this.getRowData(s));
        this.row_data.push(s);
      }
    });
  }

  getRowData(r_data) {
    let row = {
      _id: r_data._id,
      created_at: '<span>' + UtilFunc.handleDate(r_data.created_at) + '</span><small>' + UtilFunc.handleTime(r_data.created_at) + '</small>',
      user_id: r_data.user_id.email,
      register: r_data.register.name,
      reasons: r_data.reasons,
      is_credit: '',
      transaction: ''
    }
    if(r_data.is_credit == '1') {
      row.is_credit = '<span class="credit">Credit</span>'; 
      row.transaction = '<span class="credit">+ $' + r_data.transaction + '</span>';
    } else {
      row.is_credit = '<span class="debit">Debit</span>'; 
      row.transaction = '<span class="debit">- $' + r_data.transaction + '</span>';
    }
    return row;
  }

  addCash() {
    let cash = {
      _id: '',
      reasons: '',
      transaction: 1,
      is_credit: '1'      
    }
    this.openEditDialog(cash);
  }

  editCash(row) {
    let index = this.row_data.findIndex(item => item._id == row._id);
    if(index > -1) {
      this.openEditDialog(this.row_data[index]);
    } else {
      this.toastService.show('No existing cash');
    }
  }

  async openEditDialog(cash) {    
    const popover = await this.popoverController.create({
      component: EditCashComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {cash: cash, user: this.user, main_outlet: this.main_outlet}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process) this.search();
      }
    });

    await popover.present(); 
  }

  deleteCash(row){    
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this cash?', () => {      
      this.utilService.delete('sell/cash?_id=' + row._id).subscribe(async result => {        
        this.search();
      }, error => {
        this.toastService.show(Constants.message.failedRemove)
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchCashComponent,
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
