import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPage } from 'src/app/components/table/table.component';
import { Product } from 'src/app/_classes/product.class';
import { ProductDataSource } from 'src/app/_datasource/product.datasource';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AlertService } from 'src/app/_services/alert.service';
import { NavController, PopoverController } from '@ionic/angular';
import { SearchProductComponent } from 'src/app/components/search-product/search-product.component';
import { ProductService } from 'src/app/_services/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  title:string = 'Products';
  allData:Product[] = [];
  tableData = [];  
  permission:boolean = false;
  user: any;  

  filter = {
    keyword: '',   
    type: '',
    tag: '',
    supplier: '',
    brand: '',
    attribute: '',
    enabled: '',    
    range: 'all-factor'
  }  
  sort = {
    field: 'name',
    order: 1,
  }
  dataSource: ProductDataSource;
  page: IPage;

  rows:any[];
  all_columns:any[] = [
    {prop: 'name', name: 'Name', sortable: true, checked: true},
    {prop: 'type', name: 'Category', sortable: true, checked: true},
    {prop: 'barcode', name: 'Barcode', sortable: true, checked: true},
    {prop: 'retail_price', name: 'Retail Price', sortable: true, checked: true},
    {prop: 'inventory', name: 'Inventory', sortable: true, checked: true},
    {prop: 'enabled', name: 'Active', sortable: true, checked: true},
    {prop: 'touch', name: 'Touch', sortable: true, checked: true},
    {prop: 'created_at', name: 'Created', sortable: true, checked: true}
  ];
  show_columns:any[] = [2, 3, 5, 7, 8];

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private popoverController: PopoverController,
    private nav: NavController,
    private productService: ProductService
  ) {
    this.dataSource = new ProductDataSource(this.authService, this.utilService);
    this.page = {totalElements: 0, pageNumber: 0};

    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if(this.user.role) {
        this.permission = this.user.role.permissions.includes('create_products');
      }
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(data => {
      if (data) {
        const {property, value} = data;
        if(property && value) this.filter[property] = value;
      }
      this.search();
    });
  }
  
  public get loading():boolean {
    return this.dataSource.loading2;
  }

  ionViewDidEnter() {
    if(this.productService.changed) {
      this.search();
      this.productService.changed = false;      
    }
  }

  search() {        
    this.dataSource.searchProducts(this.filter, this.page.pageNumber, this.sort, result => {
      this.page.totalElements = result.total;     
      this.rows = [];
      for(let s of result.data) {
        this.rows.push(this.getRowData(s));
      }
    });
  }

  getRowData(product:Product) {
    let row = {
      name: product.data.name,
      type: product.data.type.name,
      barcode: product.data.barcode,
      retail_price: product.retail_price,
      inventory: product.totalInventory,
      enabled: product.data.enabled ? '<i class="far fa-check-circle fa-lg success"></i>':'<i class="far fa-times-circle fa-lg danger"></i>',
      touch: product.data.touch ? '<i class="far fa-check-circle fa-lg success"></i>':'<i class="far fa-times-circle fa-lg danger"></i>',
      created_at: UtilFunc.handleDate(product.data.created_at),
      product: product
    }
    return row;
  }

  onSort(sort:any) {    
    setTimeout(() => {
      this.sort.field = sort.prop;
      this.sort.order = (sort.dir === 'desc' ? -1 : 1);
      this.search();
    }, 200);
  }

  onPage(offset) {
    this.page.pageNumber = offset;
    this.search();
  }

  addNew() {
    this.productService.init();
    this.nav.navigateForward(['edit-product']);
  }

  edit(row:any) {
    this.productService.init(row.product.data);
    //this.productService.product = row.product;
    this.nav.navigateForward(['edit-product']);
  }

  delete(row:any) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this product?', () => {
      let product:Product = row.product;
      product.delete(() => {
        this.page.pageNumber = 0;
        this.search();
      })
    })
  }

  async openSearch() {
    const popover = await this.popoverController.create({
      component: SearchProductComponent,
      // event: ev,
      cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {filter: this.filter}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        if(data.process && data.filter) {
          for(let key in data.filter) {
            this.filter[key] = data.filter[key];
          }
          this.search();
        }
      }
    });

    await popover.present(); 
  }

}
