import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmployeesPageRoutingModule } from './employees-routing.module';
import { ShareModule } from 'src/app/_shared/share.module';
import { RolesPage } from './roles/roles.page';
import { EmployeesPage } from './employees/employees.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    EmployeesPageRoutingModule
  ],
  declarations: [
    RolesPage,
    EmployeesPage
  ]
})
export class EmployeesPageModule {}
