import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/_services/toast.service';
import { AuthService } from 'src/app/_services/auth.service';
import { StorePolicy } from 'src/app/_classes/store_policy.class';

@Component({
  selector: 'app-store-policy',
  templateUrl: './store-policy.page.html',
  styleUrls: ['./store-policy.page.scss'],
})
export class StorePolicyPage implements OnInit {  
  title:string = 'Store Policy Setup';
  
  cur_tab: string = 'modules';
  STORE_POLICY = StorePolicy;
  user: any;
  permission: boolean = true;  

  weeks:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  days:number[] = [];
  weekly_day = 1;
  bi_weekly_day = 1;
  monthly_day = 1;

  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    public store_policy:StorePolicy
  ) { 
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        //this.permission = this.user.role.permissions.includes('manage_payment_type');
      }
    });
    this.store_policy.load(() => {
      if(this.store_policy.employee_timesheet.pay_start_day.mode == 'weekly') {
        this.weekly_day = this.store_policy.employee_timesheet.pay_start_day.day;
      }
      if(this.store_policy.employee_timesheet.pay_start_day.mode == 'bi_weekly') {
        this.bi_weekly_day = this.store_policy.employee_timesheet.pay_start_day.day;
      }
      if(this.store_policy.employee_timesheet.pay_start_day.mode == 'monthly') {
        this.monthly_day = this.store_policy.employee_timesheet.pay_start_day.day;
      }
    });
    for(let i=1; i<=31; i++) this.days.push(i);

  }

  ngOnInit() {
  }

  save() {
    if(this.store_policy.employee_timesheet.pay_start_day.mode == 'weekly') {
      this.store_policy.employee_timesheet.pay_start_day.day = this.weekly_day;
    }
    if(this.store_policy.employee_timesheet.pay_start_day.mode == 'bi_weekly') {
      this.store_policy.employee_timesheet.pay_start_day.day = this.bi_weekly_day;
    }
    if(this.store_policy.employee_timesheet.pay_start_day.mode == 'monthly') {
      this.store_policy.employee_timesheet.pay_start_day.day = this.monthly_day;
    }
    this.store_policy.save(() => {
      this.toastService.show("Store police save successful!");
    })
  }

}
