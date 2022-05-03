import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EditPriceBookComponent } from 'src/app/components/edit-price-book/edit-price-book.component';
import { SearchPriceBookComponent } from 'src/app/components/search-price-book/search-price-book.component';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-price-books',
  templateUrl: './price-books.page.html',
  styleUrls: ['./price-books.page.scss'],
})
export class PriceBooksPage implements OnInit {

  title:string = 'Price Books';
  allData = [];
  tableData = [];
  loading: boolean = false;
  permission:boolean = false;
  user: any;

  filter = {
    name: '',
    group: '',
    outlet: '',
    start: '',
    end: '',
    sort_field: 'name',
    sort_order: 'asc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'group', name: 'Customer Group', sortable: true, checked: true},
    {prop: 'outlet', name: 'Outlet', sortable: true, checked: true},
    {prop: 'start', name: 'Valid From', sortable: true, checked: true},
    {prop: 'end', name: 'Valid To', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 3, 5];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('create_price_books');
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  initTable() {
    this.utilService.get('product/price_book', {}).subscribe(result => {
      this.allData = result.body;      
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
    this.rows = [];
    for(let a of this.allData) {
      let c = true;
      if(this.filter.name) {        
        c = c && a.name.toLowerCase().indexOf(this.filter.name.toLowerCase().trim())>-1;
      }
      if(this.filter.group) {
        c = c && (a.groupId && a.groupId._id == this.filter.group);
      }
      if(this.filter.outlet) {
        c = c && (a.outletId && a.outletId._id == this.filter.outlet);
      }
      if(this.filter.start) {
        c = c && UtilFunc.compareDate(a.validFrom, this.filter.start) >= 0;
      }
      if(this.filter.end) {
        c = c && UtilFunc.compareDate(a.validTo, this.filter.end) <= 0;
      }
      if(!c) continue;
      let data = {
        _id: a._id,
        name: a.name,
        group: 'All Customers',
        outlet: 'All Outlets',
        start: UtilFunc.handleDate(a.validFrom),
        end: UtilFunc.handleDate(a.validTo)
      };
      if(a.groupId) data.group = a.groupId.name;        
      if(a.outletId) data.outlet = a.outletId.name;
      this.rows.push(data);
    }
    this._onSort();    
    this.loading = false;
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const rows = [...this.rows];      
    rows.sort((a, b)=> {
      if(['start', 'end'].includes(prop)) {
        return UtilFunc.compareDate(a[prop], b[prop]) * (dir === 'desc' ? -1 : 1);        
      } else {
        return a[prop].localeCompare(b[prop]) * (dir === 'desc' ? -1 : 1);
      }        
    })
    this.rows = rows;
  }

  onSort(sort:any) {    
    this.loading = true;
    this.filter.sort_field = sort.prop;
    this.filter.sort_order = sort.dir;
    setTimeout(() => {
      this._onSort();      
      this.loading = false;
    }, 200);
  }

  addNew() {
    this.openEdit({
      _id: '',
      name: '',
      groupId: '',
      outletId: '',
      validFrom: '',
      validTo: '',
      private_web_address: this.user.private_web_address
    })
  }

  edit(row:any) {
    let index = this.allData.findIndex(item => item._id == row._id), book = this.allData[index];
    let data = {
      _id: row._id,
      name: row.name,
      groupId: '',
      outletId: '',
      validFrom: UtilFunc.handleDate(book.validFrom),
      validTo: UtilFunc.handleDate(book.validTo)
    };
    if(book.groupId) data.groupId = book.groupId._id;
    if(book.outletId) data.outletId = book.outletId._id;
    this.openEdit(data);
  }

  async openEdit(row) {
    const popover = await this.popoverController.create({
      component: EditPriceBookComponent,
      //event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {row: row}
    });
    popover.onDidDismiss().then(result => {
      if(result && result.data && result.data.process) {
        this.initTable();
      }
    })
    await popover.present(); 
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this price book?', () => {
      this.utilService.delete('product/price_book?_id=' + row._id).subscribe(result => {
        this.initTable();
      }, async error => {
        this.toastService.show(Constants.message.failedRemove)
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchPriceBookComponent,
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
