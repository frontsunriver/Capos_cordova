import { Component, OnInit, Input } from '@angular/core';
import { Product } from 'src/app/_classes/product.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {

  @Input('product') product: Product;
  util = UtilFunc;

  constructor() { }

  ngOnInit() {
    
  }

}
