import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-linked-products',
  templateUrl: './linked-products.component.html',
  styleUrls: ['./linked-products.component.scss'],
})
export class LinkedProductsComponent implements OnInit {
  @Input('row') row:any;

  constructor(
    private nav: NavController
  ) { }

  ngOnInit() {}

  searchProduct() {
    if(this.row.products == 0) return;    
    this.nav.navigateForward(['main/product/product'], {queryParams: {property: this.row.property, value: this.row._id}});
  }

}
