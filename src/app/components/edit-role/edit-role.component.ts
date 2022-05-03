import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { RoleService } from 'src/app/_services/role.service';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
})
export class EditRoleComponent implements OnInit {
  
  title:string = 'Add New Role';    
  form: FormGroup;
  isSubmitted: boolean = false;
  duplicate_error: boolean = false;  
  select_all: boolean = false;
  util = UtilFunc;
  user:any;

  constructor(
    private nav: NavController,
    private authService: AuthService,
    private utilService: UtilService,
    private toastService: ToastService,
    private loading: LoadingService,
    private roleServcie: RoleService,
    private fb: FormBuilder
  ) {    
    
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    })

    this.form = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    
  }

  ionViewDidEnter() {    
    if(this.role._id) {
      this.title = 'Edit Role';
      this.form.get('name').setValue(this.role.name);      
    }
  }

  public get role():any {
    return this.roleServcie.role;
  }

  public get permissions(): any {
    return this.roleServcie.permissions;
  }

  public get rolePermissions(): any{
    return this.roleServcie.rolePermissions;
  }

  async submit() {
    this.isSubmitted = true;  
    this.duplicate_error = false;
    if(this.form.invalid) return;        
    const data = this.form.value;  
    data.permissions = [];
    Object.keys(this.permissions).forEach(key => {
      if(this.permissions[key]) {
        data.permissions.push(key);
      }
    })
    if(data.permissions.length == 0) {
      this.toastService.show('Please select a permission at least');
      return;
    }     
    await this.loading.create();
    if(this.role._id) {
      data._id = this.role._id;
      this.utilService.put('auth/role', data).subscribe(async result => {
        await this.final_process(result);
      })
    } else {                 
      data.private_web_address = this.user.private_web_address; 
      this.utilService.post('auth/role', data).subscribe(async result => {
        await this.final_process(result);
      })
    }
  }

  async final_process(result) {
    await this.loading.dismiss();
    if(result.body.status == 'already_exist') {      
      this.duplicate_error = true;
    } else {
      this.toastService.show(Constants.message.successSaved);
      this.roleServcie.changed = true;
      this.nav.navigateBack(['main/employees/roles']);
    }
  }

  public get checked_permissions():any {
    let c = {all: 0, checked: 0};
    for(let key in this.permissions) {
      if(this.permissions[key]) c.checked++;
      c.all++;
    }
    return c;
  }

  updateAllCheck() {
    if(this.checked_permissions.checked == 0) {
      this.select_all = false;
    } else if(this.checked_permissions.all == this.checked_permissions.checked) {
      this.select_all = true;
    }    
  }

  someCheck(): boolean {    
    let c = this.checked_permissions.checked;
    let all = this.checked_permissions.all;
    if (c == 0) {
      return false;
    }
    return all != c;
  }

  selectAll() {
    let checked = this.select_all;    
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = checked;
    })    
  }  

  back() {
    this.nav.back();
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }        
    if (this.duplicate_error) {return 'Already existing role.';}
  }

}
