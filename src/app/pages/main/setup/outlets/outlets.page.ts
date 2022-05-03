import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

interface IData{
  _id: string,
  name: string,
  default_tax: string,
  is_main: string,
  register: any[]
}

@Component({
  selector: 'app-outlets',
  templateUrl: './outlets.page.html',
  styleUrls: ['./outlets.page.scss'],
})
export class OutletsPage implements OnInit {
  title:string = 'Outlets & Registers';
  user: any;
  permission: boolean = false;
  loading: boolean = false;
  
  rows:IData[];  
  all_columns:any[] = [
    { prop: 'name', name:'Name', sortable: true, checked: true },     
    { prop: 'default_tax', name:'Sales Tax', sortable: true, checked: true }, 
    { prop: 'is_main', name: 'Main Oultlet', sortable: true, checked: true },
  ];
  show_columns:any[] = [2, 3];  

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private toastService: ToastService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('manage_outlet');
      }
    });
  }

  ngOnInit() {
    this.initTable();
  }

  ionViewDidEnter() {
    if(this.utilService.reload_outlets) {
      this.initTable();      
    }
  }

  initTable(): void {    
    this.loading = true;
    this.utilService.get('sell/outlet', {}).subscribe(result => {         
      this.loading = false;
      if(result && result.body) {     
        this.rows = [];
        for(let r of result.body){
          let row:IData = {
            _id: r._id,
            name: r.name,
            is_main: r.is_main ? '<i class="far fa-check-circle fa-lg success"></i>':'<i class="far fa-times-circle fa-lg danger"></i>',
            register: r.register,
            default_tax: '-'
          };
          if(r.defaultTax) {
            row.default_tax = r.defaultTax.name + ' ' + r.defaultTax.rate + '%';
          }
          this.rows.push(row);
        }        
      } else {
        this.rows = [];
      }
    }, error => {
      this.loading = false;
    });    
  }

  addOutlet(){    
    this.router.navigate(['main/setup/outlets/edit-outlet']);    
  }

  editOutlet(row:IData) {
    this.router.navigate(['main/setup/outlets/edit-outlet'], {queryParams: {_id: row._id}});
  }

  deleteOutlet(row:IData) {        
    if(this.rows.length == 1) {
      this.toastService.show('Store has to have at least a outlet.');
      return;
    }
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this outlet?', () => {
      this.utilService.delete('sell/outlet?_id=' + row._id).subscribe(result => {
        this.initTable();
      }, async error => {
        this.toastService.show(Constants.message.failedRemove)
      })
    })
  }
  
}
