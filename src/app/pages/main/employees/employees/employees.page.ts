import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { SearchEmployeeComponent } from 'src/app/components/search-employee/search-employee.component';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { EmployeeService, IUser } from 'src/app/_services/employee.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit {

  title: string = 'User/Employee';
  allData:any[] = [];
  tableData = [];
  loading: boolean = false;
  permission:boolean = false;
  user: any;

  filter = {
    keyword: '',    
    role: '',
    outlet: '',
    sort_field: 'name',
    sort_order: 'asc'
  }
  rows:any[];
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'email', name: 'Email', sortable: true, checked: true},
    {prop: 'role', name: 'Role', sortable: true, checked: true},
    {prop: 'outlet', name: 'Outlet', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 4];
  
  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private popoverController: PopoverController,  
    private employeeService: EmployeeService,  
    private nav: NavController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {        
        this.permission = this.user.role.permissions.includes('add_cashier') && this.user.role.permissions.includes('add_manager');        
      }
    });
  }

  ngOnInit() {
    this.search();
  }

  ionViewDidEnter() {
    if(this.employeeService.changed) {
      this.initTable();
      this.employeeService.changed = false;
    }
  }

  initTable() {
    this.allData = [];
    this.utilService.get('auth/users', {}).subscribe(result => {
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
        c = c && (a.first_name && a.first_name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1 || 
                a.last_name && a.last_name.toLowerCase().indexOf(keyword.toLowerCase().trim())>-1);
      }
      if(this.filter.role) {
        c = c && (a.role && a.role._id == this.filter.role);
      }
      if(this.filter.outlet) {
        c = c && (a.outlet && a.outlet._id == this.filter.outlet);
      }
      if(!c) continue;
      this.rows.push({
        _id: a._id,
        name: a.first_name + ' ' + a.last_name,
        email: a.email,
        role: a.role ? a.role.name : '-',
        outlet: a.outlet ? a.outlet.name:'-',
        employee: a
      })
    }
    this.loading = false;
  }

  addNew() {
    this.employeeService.init();
    this.nav.navigateForward(['edit-employee']);
  }

  edit(row:any) {
    this.employeeService.init(row.employee);
    this.nav.navigateForward(['edit-employee']);
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this employee?', () => {
      this.utilService.delete('auth/user?name=' + row.name).subscribe(result => {
        this.initTable();
      }, async error => {
        this.toastService.show(Constants.message.failedRemove)
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchEmployeeComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
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
