import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { SearchKeywordComponent } from 'src/app/components/search-keyword/search-keyword.component';
import { Bundle } from 'src/app/_classes/bundle.class';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { BundleService } from 'src/app/_services/bundle.service';

@Component({
  selector: 'app-bundles',
  templateUrl: './bundles.page.html',
  styleUrls: ['./bundles.page.scss'],
})
export class BundlesPage implements OnInit {

  title:string = 'Bundle Prices';
  allData:Bundle[] = [];
  tableData = [];
  loading: boolean = false;
  permission:boolean = false;
  user: any;

  filter = {
    keyword: '',    
    sort_field: 'name',
    sort_order: 'asc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'price', name: 'Price', sortable: true, checked: true},
    {prop: 'count', name: 'Count', sortable: true, checked: true},
    {prop: 'discount', name: 'Discount', sortable: true, checked: true},
    {prop: 'products', name: 'Added Products', sortable: true, checked: true},
    {prop: 'active', name: 'Active', sortable: true, checked: true},
  ];
  show_columns:any[] = [3, 4, 6];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController,
    private bundleService: BundleService,
    private nav: NavController
  ) {

  }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.bundleService.changed) {
      this.initTable();
      this.bundleService.changed = false;
      this.bundleService.init();
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('product/bundle', {}).subscribe(result => {
      if(result && result.body) {
        for(let r of result.body) {
          let bundle = new Bundle(this.authService, this.utilService);
          bundle.loadDetails(r);
          this.allData.push(bundle);
        }
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
        c = c && (a.name && a.name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(!c) continue;
      this.tableData.push({
        _id: a._id,
        name: a.name,
        price: a.price,        
        count: a.count,
        discount: a.discount,
        products: a.products.length,
        active: a.active,
        bundle: a
      })
    }
    this._onSort();
    this.getRowData();
    this.loading = false;
  }

  getRowData() {
    this.rows = [];
    for(let r of this.tableData) {
      this.rows.push({
        _id: r._id,
        name: r.name,
        price: UtilFunc.getPriceWithCurrency(r.price),
        count: r.count,
        discount: UtilFunc.getPriceWithCurrency(r.discount),
        products: r.products,
        active: r.active?'<i class="far fa-check-circle fa-lg success"></i>':'<i class="far fa-times-circle fa-lg danger"></i>',
        bundle: r.bundle
      })
    }
  }

  _onSort() {
    let prop = this.filter.sort_field;
    let dir = this.filter.sort_order;
    const tableData = [...this.tableData];      
    tableData.sort((a, b)=> {
      if(['price', 'count', 'discount', 'products'].includes(prop)) {
        return (a[prop] - b[prop]) * (dir === 'desc' ? -1 : 1);        
      } else {
        return a[prop].localeCompare(b[prop]) * (dir === 'desc' ? -1 : 1);
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
      this.loading = false;
    }, 200);
  }

  addNew() {
    this.bundleService.init();
    this.nav.navigateForward(['edit-bundle']);    
  }

  edit(row:any) {
    this.bundleService.bundle = row.bundle;
    this.nav.navigateForward(['edit-bundle']);
  }

  delete(row:any) {
    let index = this.allData.findIndex(item => item._id == row._id);
    let bundle = this.allData[index];
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this bundle?', () => {
      bundle.delete(() => {        
        this.initTable();
      }, () => {
        this.toastService.show(Constants.message.failedRemove)
      })      
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchKeywordComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {keyword: this.filter.keyword, title: 'Product Bundle', label: 'Name'}
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
