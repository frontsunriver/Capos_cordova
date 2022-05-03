import { ThisReceiver } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role:any;
  permissions = {};  
  rolePermissions = [];
  user:any;
  changed: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) {    
    this.role = {
      name: '',
      private_web_address: '',
      permissions: []
    }
    this.utilService.get('util/permissions', {}).subscribe(result => {
      this.rolePermissions = result.body;
      this.init();
    })  
  }

  init(details?:any) {
    this.role = {
      _id: '',
      name: '',      
      permissions: []
    }
    for(let p of this.rolePermissions) {
      this.permissions[p.uid] = false;  
    }
    if(details) {
      this.role._id = details._id;
      this.role.name = details.name;
      this.role.permissions = details.permissions;
      for(let i=0;i<this.role.permissions.length;i++) {
        this.permissions[this.role.permissions[i]] = true;
      } 
    }
  }
}
