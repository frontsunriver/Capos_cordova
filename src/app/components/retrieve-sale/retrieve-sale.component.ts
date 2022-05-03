import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { CartService } from 'src/app/_services/cart.service';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-retrieve-sale',
  templateUrl: './retrieve-sale.component.html',
  styleUrls: ['./retrieve-sale.component.scss'],
})
export class RetrieveSaleComponent implements OnInit {
  user:any;
  parked_sales = [];
  util = UtilFunc;
  
  constructor(
    private loading: LoadingService,
    private authService: AuthService,
    private utilService: UtilService,
    private cartService: CartService,
    private toastService: ToastService,
    private nav: NavController
  ) {    
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.loadParkedSales();
    })
  }

  async loadParkedSales() {
    const query={user_id: this.user._id, private_web_address: this.user.private_web_address, sale_status:'parked'};
    await this.loading.create();
    this.parked_sales = [];
    this.utilService.get('sale/sale', query).subscribe(async result => {
      await this.loading.dismiss();
      this.parked_sales = result.body;      
    })
  }

  getParkedSalelabel(sale:any) {
    let labels = [];
    for(let product of sale.products) {
      let s = product.qty + ' x ' + product.product_name;
      if(product.variant_name) {
        s += ' <small>' + product.variant_name + '</small>';
      }
      labels.push(s);
      if(labels.length == 2 && sale.products.length>2) {        
        labels.push('and ' + (sale.products.length - 2) + ' more products');
        break;
      }
    }
    return labels;
  }

  retrieveSale(sale: any) {
    this.cartService.loadCart(sale._id, '', result => {
      if(result) {
        this.nav.navigateBack(['main/sell/selling']);
      } else {
        this.toastService.show('No existing sale');
      }
    })
  }
}
