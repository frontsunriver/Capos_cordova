import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EditGroupComponent } from 'src/app/components/edit-group/edit-group.component';
import { SearchKeywordComponent } from 'src/app/components/search-keyword/search-keyword.component';
import { Group } from 'src/app/_classes/group.class';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {
  title:string = 'Customer Groups';
  allData:Group[] = [];
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
    {prop: 'limit', name: 'Limit', sortable: true, checked: true},
    {prop: 'point_rates', name: 'Point Rates', sortable: false, checked: true},
  ];
  show_columns:any[] = [2, 3];

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
        this.permission = this.user.role.permissions.includes('add_customer_groups');
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  initTable() {
    this.allData = [];
    this.utilService.get('customers/group', {}).subscribe(result => {
      for(let g of result.body) {
        let group:Group = new Group(this.authService, this.utilService);
        group.loadDetails(g);
        this.allData.push(group);
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
        limit: a.limit,
        point_rates: a.point_rates_str,
        group: a
      })
    }    
    this.loading = false;
  }

  addNew() {
    let group = new Group(this.authService, this.utilService);
    this.openEdit(group);
  }

  edit(row:any) {
    this.openEdit(row.group);
  }

  async openEdit(group:Group) {
    const popover = await this.popoverController.create({
      component: EditGroupComponent,
      //event: ev,
      cssClass: 'popover_custom',
      translucent: true,
      componentProps: {group: group}
    });
    popover.onDidDismiss().then(result => {
      if(result && result.data && result.data.process) {
        this.initTable();
      }
    })
    await popover.present(); 
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this group?', () => {
      this.utilService.delete('customers/group?_id=' + row._id).subscribe(result => {
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
      componentProps: {keyword: this.filter.keyword, title: 'Group', label: 'Name'}
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
