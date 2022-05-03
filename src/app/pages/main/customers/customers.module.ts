import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomersPageRoutingModule } from './customers-routing.module';
import { CustomersPage } from './customers/customers.page';
import { GroupPage } from './group/group.page';
import { ShareModule } from 'src/app/_shared/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    CustomersPageRoutingModule
  ],
  declarations: [
    CustomersPage,
    GroupPage
  ]
})
export class CustomersPageModule {}
