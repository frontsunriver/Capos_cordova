import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Onlineorder } from 'src/app/_classes/onlineorder.class';
import { Product } from 'src/app/_classes/product.class';
import { Producttype } from 'src/app/_classes/producttype.class';
import { ProductDataSource } from 'src/app/_datasource/product.datasource';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { OnlineOrderService } from 'src/app/_services/online-order.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

interface IProduct {
  _id: string,
  name: string,
  barcode: string,
  image: string,
  price: string,
  product: Product
}

@Component({
  selector: 'app-add-to-online-order',
  templateUrl: './add-to-online-order.component.html',
  styleUrls: ['./add-to-online-order.component.scss'],
})
export class AddToOnlineOrderComponent implements OnInit {

  @ViewChild('search') searchCtrl: any;
  util = UtilFunc;
  user: any;
  keyword:string = '';
  categories:Producttype[] = [];
  selectedCategory: Producttype = null;
  all_products: IProduct[] = [];  
  products:IProduct[] = [];
  private perPage:number = 10;
  private allPageIndex: number = 0;
  private searchPageIndex: number = 0;
  private allTotal: number = 0;
  private searchTotal: number = 0;  
  productDatasource: ProductDataSource;
  is_loading: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private loading: LoadingService,    
    private nav: NavController,
    private onlineOrderService: OnlineOrderService,
    private toastService: ToastService
  ) {
    this.productDatasource = new ProductDataSource(this.authService, this.utilService);
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    }) 
  }

  ngOnInit() {    
    this.selectedCategory = null;    
    this.loadCategories();
  }

  loadCategories() {
    let all = new Producttype(this.authService, this.utilService);
    this.categories.push(all);    
    all.data.name = 'All Products';
    let products = 0;
    this.utilService.get('product/type', {touch:true}).subscribe(result => {
      if(result && result.body) {
        for(let t of result.body) {
          let type = new Producttype(this.authService, this.utilService);
          type.loadDetails(t);
          this.categories.push(type);
          products += type.data.products;
        }
        all.data.products = products;        
      }      
      this.selectedCategory = all;
      this.searchProduct();
    })
  }

  async loadProducts() {       
    if(this.is_loading) return;
    this.is_loading = true;
    let first_loading = this.pageIndex == 0;    
    if(first_loading) await this.loading.create();
    const filter = {range: 'all-factor', keyword: this.keyword, type: this.selectedCategory._id};
    this.productDatasource.loadProducts(filter, this.pageIndex, this.perPage, 'name', 1, async () => {
      if(!this.isAllProducts) {
        this.searchTotal = this.productDatasource.totalElements;
      } else {
        this.allTotal = this.productDatasource.totalElements;
      }
      if(!this.isLastPageReached) {
        if(!this.isAllProducts) this.searchPageIndex++; else this.allPageIndex++;        
      }
      for(let p of this.productDatasource.data) {
        let iproduct:IProduct = {
          _id: p._id,
          name: p.data.name,
          barcode: p.data.barcode,
          image: p.image,
          price: this.util.getPriceWithCurrency(p.data.retail_price),
          product: p
        };                
        this.products.push(iproduct);
        if(this.isAllProducts) this.all_products.push(iproduct);
      }
      if(first_loading) await this.loading.dismiss();     
      this.focusKeyword()
      this.is_loading = false;
    })
  }

  searchProduct() {
    this.products = [];    
    if(!this.isAllProducts) this.searchPageIndex = 0;
    if(this.pageIndex == 0) {
      this.loadProducts();
    } else {      
      for(let p of this.all_products) {          
        this.products.push(p);
      }
      this.focusKeyword();
    }    
  }

  clearKeyword() {
    this.keyword = '';
    this.searchProduct();
  }

  doInfinite(infiniteScroll:any) {    
    setTimeout(() => {
      this.loadProducts();      
      infiniteScroll.target.complete();
    }, 500);
  }

  get pageIndex():number {
    if(!this.isAllProducts) {
      return this.searchPageIndex;
    } else {
      return this.allPageIndex;
    }
  }

  get isLastPageReached():boolean {
    if(!this.isAllProducts) {
      return Math.ceil(this.searchTotal / this.perPage) <= this.searchPageIndex;
    } else {
      return Math.ceil(this.allTotal / this.perPage) <= this.allPageIndex;
    }
  }

  get isAllProducts(): boolean {
    if(this.keyword || (this.selectedCategory && this.selectedCategory._id)) {
      return false;
    } else {
      return true;
    }
  }

  get order():Onlineorder {
    return this.onlineOrderService.order;
  }

  selProduct(p:IProduct) {    
    let product = p.product;
    this.onlineOrderService.addProduct(product)
    this.toastService.show('Added to order successfully');
  }

  back() {
    this.nav.back();
  }

  async done() {
    this.nav.back();
  }

  focusKeyword() {
    setTimeout(() => {
      this.searchCtrl.setFocus();
    }, 500);
  }

}
