import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicGestureConfig } from './_configs/IonicGestureConfig';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ShareModule } from './_shared/share.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Camera } from '@ionic-native/Camera/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { Device } from "@ionic-native/device/ngx";
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';

export function tokenGetter(): any {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, BrowserAnimationsModule, IonicModule.forRoot(), 
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: ['localhost:3200', '10.10.13.189:3200', 'http://18.217.176.191'],
      },
    }),
    NgxDatatableModule,
    AppRoutingModule,
    ShareModule
  ],
  providers: [
    Camera, 
    Printer,
    Device,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    IonicGestureConfig,
    BluetoothSerial
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
