import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Product } from 'src/app/_classes/product.class';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { ProductDataSource } from 'src/app/_datasource/product.datasource';
import { UtilService } from 'src/app/_services/util.service';

interface IProduct {
  _id: string,
  name: string,
  barcode: string,
  image: string,
  is_check: boolean;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  @ViewChild('search') searchCtrl: any;
  user: any;
  keyword:string = '';
  sel_products: IProduct[] = [];
  all_products: IProduct[] = [];  
  products:IProduct[] = [];
  private perPage:number = 10;
  private allPageIndex: number = 0;
  private searchPageIndex: number = 0;
  private allTotal: number = 0;
  private searchTotal: number = 0;  
  productDatasource: ProductDataSource;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private loading: LoadingService,    
    private nav: NavController
  ) {
    this.productDatasource = new ProductDataSource(this.authService, this.utilService);
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.loadSelProducts();
    })    
  }

  ngOnInit() {
    this.utilService.reload_sel_products = false;
  }

  loadSelProducts() {        
    this.utilService.get('product/sel_product', {user_id: this.user._id}).subscribe(result => {      
      if(result && result.body) {        
        for(let p of result.body.products) {
          let product = new Product(this.authService, this.utilService);
          product.loadDetails(p);
          let iproduct:IProduct = {
            _id: product._id,
            name: product.data.name,
            barcode: product.data.barcode,
            image: product.image,
            is_check: true
          };
          this.sel_products.push(iproduct);
        }
      }      
      this.searchProduct();
    })
  }

  async loadProducts() {
    let is_loading = this.pageIndex == 0;
    if(is_loading) await this.loading.create();
    const filter = {range: 'all-factor', keyword: this.keyword};            
    this.productDatasource.loadProducts(filter, this.pageIndex, this.perPage, 'name', 1, async () => {
      if(this.keyword) {
        this.searchTotal = this.productDatasource.totalElements;
      } else {
        this.allTotal = this.productDatasource.totalElements;
      }
      if(!this.isLastPageReached) {
        if(this.keyword) this.searchPageIndex++; else this.allPageIndex++;
      }
      for(let p of this.productDatasource.data) {
        let iproduct:IProduct = {
          _id: p._id,
          name: p.data.name,
          barcode: p.data.barcode,
          image: p.image,
          is_check: false
        };        
        let index = this.sel_products.findIndex(item => item._id == iproduct._id);
        if(index == -1) this.products.push(iproduct);
        if(!this.keyword) this.all_products.push(iproduct);
      }
      if(is_loading) await this.loading.dismiss();     
      this.focusKeyword()
    })
  }

  searchProduct() {
    this.products = [];
    if(this.keyword) {
      this.searchPageIndex = 0;
      for(let p of this.sel_products) {        
        if(p.name.toUpperCase().indexOf(this.keyword.toUpperCase())>=0 || p.barcode.indexOf(this.keyword)>=0) {
          this.products.push(p);
        }
      }      
    } else {      
      for(let p of this.sel_products) this.products.push(p);      
    }
    if(this.pageIndex == 0) {
      this.loadProducts();
    } else {
      if(!this.keyword) {        
        for(let p of this.all_products) {
          let index = this.sel_products.findIndex(item => item._id == p._id);
          if(index == -1) {
            this.products.push(p);
          }
        }
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
    if(this.keyword) {
      return this.searchPageIndex;
    } else {
      return this.allPageIndex;
    }
  }

  get isLastPageReached():boolean {
    if(this.keyword) {
      return Math.ceil(this.searchTotal / this.perPage) <= this.searchPageIndex;
    } else {
      return Math.ceil(this.allTotal / this.perPage) <= this.allPageIndex;
    }
  }

  selProduct(p:IProduct) {    
    let index = this.sel_products.findIndex(item => item._id == p._id);
    if(p.is_check) {      
      if(index == -1) this.sel_products.push(p);
    } else {      
      if(index>=0) this.sel_products.splice(index, 1);
    }
  }

  back() {
    this.nav.back();
  }

  async save() {
    let sel_products = [];
    for(let p of this.sel_products) sel_products.push(p._id);
    const data = {
      private_web_address: this.user.private_web_address,
      user_id: this.user._id,
      sel_products: sel_products.join(',')
    }
    await this.loading.create();
    this.utilService.post('product/sel_product', data).subscribe(async result => {      
      await this.loading.dismiss();
      this.utilService.reload_sel_products = true;
      this.nav.navigateBack('main/home');      
    })
  }

  focusKeyword() {
    setTimeout(() => {
      this.searchCtrl.setFocus();
    }, 500);
  }
}
