import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { EmployeeService, IUser } from 'src/app/_services/employee.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { UtilService } from 'src/app/_services/util.service';
import { Constants } from 'src/app/_configs/constants';
import { NavController, PopoverController } from '@ionic/angular';
import { ToastService } from 'src/app/_services/toast.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { TableColumnsComponent } from '../table-columns/table-columns.component';
import { AlertService } from 'src/app/_services/alert.service';
import { EditTimesheetComponent } from '../edit-timesheet/edit-timesheet.component';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
})
export class EditEmployeeComponent implements OnInit {
  title:string = 'Add New Employee';
  form: FormGroup;
  outlets = [];
  roles = [];       
  util = UtilFunc;
  add_new: boolean = true;
  cur_tab:string = 'bio';
  hide:boolean = true;
  outlet: string;
  role: string;
  isSubmitted: boolean = false;
  duplicate_error: boolean = false;

  @ViewChild('myTable') table: any;
  timesheets = [];
  rows:any[];
  all_columns:any[] = [
    {prop: 'date', name: 'Date', sortable: true, checked: true},
    {prop: 'start', name: 'Start', sortable: true, checked: true},
    {prop: 'end', name: 'End', sortable: true, checked: true},
    {prop: 'duration', name: 'Duration', sortable: true, checked: true}
  ];
  show_columns:any[] = [3, 4];
  loading:boolean = false;
  expand:string = 'down';
  show_column:number; 
  ColumnMode = ColumnMode;   
  SelectionType = SelectionType;
  selected = [];

  constructor(
    private utilService: UtilService,
    private toastService: ToastService,
    private loadiingService: LoadingService,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private nav: NavController,
    private popoverController: PopoverController
  ) {
    this.roles = [{_id:'', name:'Free'}];
    this.utilService.get('auth/role', {}).subscribe(result => {
      this.roles = this.roles.concat(result.body);
    });   

    this.outlets = [{_id:'', name:'All Outlets'}];
    this.utilService.get('sell/outlet', {}).subscribe(result => {
      this.outlets = this.outlets.concat(result.body);
    }); 
  }

  ngOnInit() {
    this.add_new = this.user._id == '';
    this.initForm();
    if(!this.add_new) {
      this.title = 'Edit Employee';      
    }
  }

  initForm() {
    let passwordValidators = [Validators.minLength(6), Validators.maxLength(12)];
    if (this.add_new) {
      passwordValidators.push(Validators.required);
    }
    this.form = this.fb.group({
      first_name:['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators]      
    });    
    this.outlet = ''; this.role = '';
  }

  ionViewDidEnter() {
    if(!this.add_new) {        
      Object.keys(this.form.value).forEach(key => {
        if(key != 'password') {
          this.form.get(key).setValue(this.user[key]);
        }
      })
      this.outlet = this.user.outlet;
      this.role = this.user.role;
      this.search();
    }
  }

  public get user():IUser {
    return this.employeeService.user;
  }

  public get countries():any[] {
    return this.employeeService.countries;
  }

  async submit(){    
    this.isSubmitted = true;
    this.duplicate_error = false;
    if(this.form.valid){            
      for(const key in this.form.value) {
        this.user[key] = this.form.get(key).value;
      }
      this.user.role = this.role;
      this.user.outlet = this.outlet;
      await this.loadiingService.create();
      if(!this.add_new){        
        this.utilService.put('auth/user', this.user).subscribe((result) => {
          this.final_process(result);
        }, error => {this.toastService.show(error)});
      } else {
        delete this.user._id;
        this.utilService.post('auth/user', this.user).subscribe(result => {
          this.final_process(result);
        }, error => {this.toastService.show(error)});
      }
    } else {
      this.toastService.show(Constants.message.invalidFields);
    }
  }

  async final_process(result) {
    await this.loadiingService.dismiss();
    if(result.body.status == 'already_exist') {      
      this.duplicate_error = true;
    } else {
      this.employeeService.changed = true;
      this.toastService.show(Constants.message.successSaved);
      this.nav.navigateBack(['main/employees/employees']);
    }
  }

  back() {
    this.nav.back();
  }

  public get availableTable():boolean {
    return typeof this.rows != 'undefined';
  }

  public get columns():any[] {
    let result = [];
    let clms = this.all_columns.filter(item => item.checked);
    for(let i=0;i<clms.length;i++) {
      if(i>=this.show_column) break;
      result.push(clms[i]);
    }
    return result;
  }

  public get hidden_columns():any[] {
    let result = [];
    let clms = this.all_columns.filter(item => item.checked);
    for(let i=this.show_column;i<clms.length;i++) {      
      result.push(clms[i]);
    }
    return result;
  }

  search() {
    this.loading = true;
    if(this.timesheets.length == 0) {      
      this.initTimesheets()      
    } else {
      this.getTableData();
    } 
  }

  initTimesheets() {    
    this.timesheets = [];
    this.selected = [];
    this.utilService.get('auth/timesheet', {user_id: this.user._id}).subscribe(result => {
      if(result && result.body) {
        this.timesheets = result.body;
        for(let t of this.timesheets) {
          t.checked = false;
        }        
      }
      this.getTableData();
    })
  }

  getTableData() {
    this.rows = [];
    for(let t of this.timesheets) {
      this.rows.push({
        _id: t._id,
        date: UtilFunc.handleDate(t.start_date),
        start: UtilFunc.handleTime(t.start_date),
        end: UtilFunc.handleTime(t.end_date),
        duration: UtilFunc.diffHours(t.start_date, t.end_date),
        timesheet: t
      })
    }    
    this.loading = false;
  }

  async openColumns(ev: any) {    
    const popover = await this.popoverController.create({
      component: TableColumnsComponent,
      event: ev,
      //cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {all_columns: this.all_columns}
    });

    await popover.present();  
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  deleteTimesheets() {
    if(this.selected.length>0) {
      this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete selected timesheets?', () => {
        let _ids = [];
          for(let t of this.selected) _ids.push(t._id);
          this.utilService.delete('auth/timesheet?_ids=' + _ids.join(',')).subscribe(result => {
            this.toastService.show(Constants.message.successRemoved);
            this.initTimesheets();
          }, error => {
            this.toastService.show(Constants.message.failedRemove);
          });         
      })      
    }
  }

  insertTimesheet() {
    let timesheet = {
      _id: '',
      user_id: this.user._id,
      private_web_address: this.user.private_web_address,
      start_date: '',
      end_date: ''
    }    
    this.openTimesheet(timesheet);
  }

  updateTimesheet() {
    if(this.selected.length !=1) return;
    let row = this.selected[0];        
    this.openTimesheet(row.timesheet);
  }

  async openTimesheet(row:any) {
    const popover = await this.popoverController.create({
      component: EditTimesheetComponent,
      //event: ev,
      cssClass: 'popover_custom fixed-width',
      translucent: true,
      componentProps: {timesheet: row}
    });

    popover.onDidDismiss().then(result => {
      if(result && result.data) {
        if(result.data.process) {
          this.toastService.show(Constants.message.successSaved);
          this.initTimesheets();
        }
      }
    })

    await popover.present();
  }

  get checkedTimesheet() {    
    for(let t of this.timesheets) {
      if(t.checked) {
        return t;
      }
    }
    return null;
  }

  get firstNameInput(): any {return this.form.get('first_name'); }
  get firstNameInputError(): string {    
    if (this.firstNameInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get lastNameInput(): any {return this.form.get('last_name'); }
  get lastNameInputError(): string {    
    if (this.lastNameInput.hasError('required')) { return Constants.message.requiredField; }
  }  

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
    if(this.duplicate_error) return 'Already existing email';
  }

  get passwordInput(): any {return this.form.get('password'); }
  get passwordInputError(): string {
    if (this.passwordInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.passwordInput.hasError('minlength')) { return Constants.message.invalidMinLength.replace('?', Constants.password.minLength.toString()); }
    if (this.passwordInput.hasError('maxlength')) { return Constants.message.invalidMaxLength.replace('?', Constants.password.maxLength.toString()); }
  }
}
