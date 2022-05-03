import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EditProductTagComponent } from 'src/app/components/edit-product-tag/edit-product-tag.component';
import { SearchKeywordComponent } from 'src/app/components/search-keyword/search-keyword.component';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-product-tag',
  templateUrl: './product-tag.page.html',
  styleUrls: ['./product-tag.page.scss'],
})
export class ProductTagPage implements OnInit {

  title:string = 'Product Tags';
  allData = [];
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
    {prop: 'name', name: 'Name', sortable: true, checked: true}    
  ];
  show_columns:any[] = [1];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }
  
  ngOnInit() {
    this.search();
  }

  initTable() {
    this.utilService.get('product/tag', {}).subscribe(result => {
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
      if(this.filter.keyword) {
        let keyword = this.filter.keyword;
        c = c && (a.name && a.name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(!c) continue;
      this.rows.push({
        _id: a._id,
        name: a.name,
        products: a.products,
        property: 'tag'
      })
    }
    this.loading = false;
  }

  addNew() {
    this.openEdit({
      _id: '',
      name: '',      
      private_web_address: this.user.private_web_address
    })
  }

  edit(row:any) {
    this.openEdit(row);
  }

  async openEdit(row) {
    const popover = await this.popoverController.create({
      component: EditProductTagComponent,
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
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this tag?', () => {
      this.utilService.delete('product/tag?_id=' + row._id).subscribe(result => {
        this.initTable();
      }, async error => {
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
      componentProps: {keyword: this.filter.keyword, title: 'Tag', label: 'Name'}
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
