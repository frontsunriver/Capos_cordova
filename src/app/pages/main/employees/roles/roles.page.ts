import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { EditRoleComponent } from 'src/app/components/edit-role/edit-role.component';
import { Constants } from 'src/app/_configs/constants';
import { SearchKeywordComponent } from 'src/app/components/search-keyword/search-keyword.component';
import { RoleService } from 'src/app/_services/role.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {

  title:string = 'User Roles Management';
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
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'updated_at', name: 'Last Updated', sortable: true, checked: true}    
  ];
  show_columns:any[] = [2];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController,
    private roleService: RoleService,
    private nav: NavController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;   
      if(this.user.role) {        
        this.permission = this.user.role.permissions.includes('manage_role');
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.roleService.changed) {
      this.initTable();
      this.roleService.changed = false;
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('auth/role', {}).subscribe(result => {
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
        updated_at: UtilFunc.handleDateTime(a.updated_at),
        role: a
      })
    }
    this.loading = false;
  }

  addNew() {
    this.roleService.init();
    this.nav.navigateForward(['edit-role']);
  }

  edit(row:any) {
    this.roleService.init(row.role);
    this.nav.navigateForward(['edit-role']);
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this role?', () => {
      this.utilService.delete('auth/role?name=' + row.name).subscribe(result => {
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
      componentProps: {keyword: this.filter.keyword, title: 'Role', label: 'Name'}
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
