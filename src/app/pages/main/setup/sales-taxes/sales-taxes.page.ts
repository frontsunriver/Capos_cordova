import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EditTaxComponent } from 'src/app/components/edit-tax/edit-tax.component';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { UtilService } from 'src/app/_services/util.service';

export interface ITax{
  _id: string,
  name: string,
  rate: number,
  private_web_address: string
}

@Component({
  selector: 'app-sales-taxes',
  templateUrl: './sales-taxes.page.html',
  styleUrls: ['./sales-taxes.page.scss'],
})
export class SalesTaxesPage implements OnInit {
  title:string = 'Sales Taxes Setup';  
  user: any;
  permission: boolean = true;
  taxes:ITax[] = [];


  constructor(    
    private authService: AuthService,
    private utilService: UtilService,
    private loading: LoadingService,
    private popoverController: PopoverController,
    private alertService: AlertService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('manage_payment_type');
      }
    });
  }

  ngOnInit() {
    this.loadTaxes();
  }

  async loadTaxes() {
    this.taxes = [];
    await this.loading.create();
    this.utilService.get('sale/salestax', {}).subscribe(async result => {           
      await this.loading.dismiss();
      if(result && result.body) { 
        for(let t of result.body) {
          this.taxes.push({
            _id: t._id,
            name: t.name,
            rate: t.rate,
            private_web_address: t.private_web_address
          })
        }        
      }
    });
  }

  async openEditDialog(tax:ITax) {
    if(!tax) {
      tax = {
        _id: '',
        name: '',
        rate: 0,
        private_web_address: this.user.private_web_address
      };
    }
    const popover = await this.popoverController.create({
      component: EditTaxComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {tax: tax}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process) this.loadTaxes();
      }
    });

    await popover.present(); 
  }

  async deleteTax(tax:ITax) {
    this.alertService.presentAlertConfirm('Confirm Delete?', 'Are you sure to want to delete this tax?', async () => {
      await this.loading.create();
      this.utilService.delete('sale/salestax?_id=' + tax._id).subscribe(async result => {
        await this.loading.dismiss();
        this.loadTaxes();
      })
    })
  }
}
