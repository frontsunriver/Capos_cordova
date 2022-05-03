import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Cart } from 'src/app/_classes/cart.class';
import { Product } from 'src/app/_classes/product.class';
import { Chart, registerables } from 'chart.js';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { ChartSettingsComponent } from 'src/app/components/chart-settings/chart-settings.component';
import { UtilService } from 'src/app/_services/util.service';
import { AuthService } from 'src/app/_services/auth.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { CartService } from 'src/app/_services/cart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild("salesCanvas") salesCanvas: ElementRef;
  @ViewChild("productCanvas") productCanvas: ElementRef;

  public salesChart: Chart;
  public productChart: Chart;

  title:string = 'Dashboard';
  sales_mode:string = 'sales';
  interval:string = 'daily';
  date_from = '';
  date_to = ''; 
  util = UtilFunc;
  cur_date = {year: 0, month: 0, date:0};
  user:any;
  totalByMonth: string = '';
  totalByDay: string = '';
  stockLevels: number         = 0;
  stockOnHand: number         = 0;
  productsByUser:string = '';
  productsByCustomer: string  = '';
  productsByOutlet: string    = '';
  registerClosures: number    = 0;

  sales_data:Cart[] = []; 
  lineChartLabels:string[] = [];
  salesChartData:number[] = [];
  _salesChartData:number[] = [];
  _ordersChartData:number[] = [];
  salesChartLabel: string = 'Sales';
  salesBackColor:string = '';
  salesBorderColor:string = '';

  product_mode:string = 'sales';
  productChartData = [];  
  _productSalesChartData = [];
  _productOrdersChartData = [];
  selectedProducts:Product[] = [];

  constructor(
    private popoverController: PopoverController,
    private utilService: UtilService,
    private authService: AuthService,
    private loading: LoadingService
  ) {
    Chart.register(...registerables);

    this.authService.currentUser.subscribe(user => {        
      this.user = user;           
    }); 

    let date = new Date();
    this.cur_date = {
      year: date.getFullYear(), month: date.getMonth()+1, date: date.getDate()
    };

    this.date_from = [this.cur_date.year,('0' + this.cur_date.month).substr(-2), '01'].join('-');
    this.date_to = [this.cur_date.year, ('0' + this.cur_date.month).substr(-2), ('0' + this.cur_date.date).substr(-2)].join('-');        
    
  }

  ngOnInit() {    
    const start = [this.cur_date.year,('0' + this.cur_date.month).substr(-2), '01'].join('-');
    const end = [this.cur_date.year,('0' + this.cur_date.month).substr(-2), ('0' + this.cur_date.date).substr(-2)].join('-');
    let filter = {sale_status:'all_payments', start: start, end: end};
    this.utilService.get('sale/sale', filter).subscribe(result => {
      if(result && result.body) {
        let sales_data:Cart[] = [];
        for(let s of result.body) {
          let sale = new Cart(this.authService, this.utilService);
          sale.loadByCart(s);
          sales_data.push(sale);
        }
        let sum = sales_data.reduce((a, b) => a + parseFloat(b.totalExcl), 0);
        this.totalByMonth = this.util.getPriceWithCurrency(sum);
        let sales = sales_data.filter(item => this.getFormattedDate(item.created_at) == this.getFormattedDate(new Date()));
        sum = sales.reduce((a, b) => a + parseFloat(b.totalExcl), 0);
        this.totalByDay = this.util.getPriceWithCurrency(sum);
      }      
    })

    this.utilService.get('product/product', {range: 'stock_level'}).subscribe(result => {
      if(result && result.body) {
        this.stockLevels = result.body.stock_level;
        this.stockOnHand = result.body.stock;
      }
    })

    this.utilService.get('sale/sale', {sale_status:'all_payments', user_id: this.user._id}).subscribe(result => {
      if(result && result.body) {
        let sales_data:Cart[] = [];
        for(let s of result.body) {
          let sale = new Cart(this.authService, this.utilService);
          sale.loadByCart(s);
          sales_data.push(sale);
        }
        let sum = sales_data.reduce((a, b) => a + parseFloat(b.totalExcl), 0);
        this.productsByUser = this.util.getPriceWithCurrency(sum);        
        this.productsByOutlet = this.util.getPriceWithCurrency(sum);        
      }      
    })

    this.utilService.get('sale/sale', {sale_status:'all_payments', customer:'to_customer' }).subscribe(result => {
      if(result && result.body) {
        let sales_data:Cart[] = [];
        for(let s of result.body) {
          let sale = new Cart(this.authService, this.utilService);
          sale.loadByCart(s);
          sales_data.push(sale);
        }
        let sum = sales_data.reduce((a, b) => a + parseFloat(b.totalExcl), 0);
        this.productsByCustomer = this.util.getPriceWithCurrency(sum);        
      }      
    })

    this.utilService.get('sell/openclose', {status:2}).subscribe(result => {
      if(result && result.body) {
        this.registerClosures = result.body.length;
      }      
    })
  }  

  ionViewDidEnter() {
    this.initSalesChart();
    this.initProductChart();
    this.loadData();
    if(this.utilService.reload_sel_products) {
      this.loadSelProducts();      
      this.utilService.reload_sel_products = false;
    }
  }

  initSalesChart() {
    if(this.salesChart) return;
    let ctx = this.salesCanvas.nativeElement;
    ctx.height = 250;
    this.salesChart = new Chart(this.salesCanvas.nativeElement, {
      type: 'line',      
      data: this.salesChartConfigData
    });
  }  

  get salesChartConfigData():any {
    return {
      labels: this.lineChartLabels,
      datasets: [
        {
          label: this.salesChartLabel,
          fill: false,            
          backgroundColor: this.salesBackColor,
          borderColor: this.salesBorderColor,
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: this.salesBorderColor,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: this.salesBorderColor,
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.salesChartData,
          spanGaps: false
        }
      ]
    };
  }

  initProductChart() {
    if(this.productChart) return;
    let ctx = this.productCanvas.nativeElement;
    ctx.height = 250;
    this.productChart = new Chart(this.productCanvas.nativeElement, {
      type: 'line',      
      data: this.productChartConfigData
    });
  }

  get productChartConfigData():any {
    return {
      labels: this.lineChartLabels,
      datasets: this.productChartData
    };
  }

  getDefaultDataset():any {
    return {
      label: '',
      fill: false,            
      backgroundColor: '#000',
      borderColor: '#000',
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: '#000',
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#000',
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [],
      spanGaps: false
    }
  }

  get period():string {
    if(this.date_from && this.date_to) {
      return this.date_from + ' ~ ' + this.date_to;
    }
    return '';
  }

  get interval_label():string {
    return this.util.toUppercase(this.interval);
  }

  async loadData() {
    await this.loading.create();    
    const filter = {sale_status:'all_payments', start: this.date_from, end: this.date_to};
    this.sales_data = [];    
    this.utilService.get('sale/sale', filter).subscribe(result => {      
      if(result && result.body) {
        for(let s of result.body) {
          let sale = new Cart(this.authService, this.utilService);
          sale.loadByCart(s);
          this.sales_data.push(sale);
        }
      }
      this.loadDataSets();
    })    
  }

  async loadDataSets() {
    let start = new Date(this.date_from), end = new Date();
    if(this.date_to) {
      end = new Date(this.date_to);
    }    
    const all_dates = this.getAllRangeDates(start, end);
    this.lineChartLabels = [];    
    this.salesChartData = [];
    this._salesChartData = [];
    this._ordersChartData = [];

    for(let d of all_dates) {
      let label = this.getFormattedDate(d, this.interval);
      let index = this.lineChartLabels.findIndex(item => item == label);
      if(index == -1) {
        this.lineChartLabels.push(label);        
      }
    }    
    for(let d of this.lineChartLabels) {
        let sales = this.sales_data.filter(item => this.getFormattedDate(item.created_at, this.interval) == d);
        let sum = sales.reduce((a, b) => a + parseFloat(b.totalExcl), 0);                
        this._salesChartData.push(sum);
        this._ordersChartData.push(sales.length);        
    }
    this.setSalesChartData();
    
    this.productChartData = [];    
    this._productSalesChartData = [];
    this._productOrdersChartData = [];

    if(this.selectedProducts.length == 0) {
      this.loadSelProducts();
    } else {
      for(let p of this.selectedProducts) {
        this.loadProductData(p);
      }
      this.setProductsChartData();
      await this.loading.dismiss();
    }
  }

  async loadSelProducts() {
    this.productChartData = [];    
    this._productSalesChartData = [];
    this._productOrdersChartData = [];
    this.selectedProducts = [];
    if(!this.loading.loadingElement) await this.loading.create();    
    this.utilService.get('product/sel_product', {user_id: this.user._id}).subscribe(async result => {      
      if(result && result.body) {        
        for(let p of result.body.products) {
          let product = new Product(this.authService, this.utilService);
          product.loadDetails(p);
          this.selectedProducts.push(product);
          this.loadProductData(product);
        }
      }  
      this.setProductsChartData();
      await this.loading.dismiss();    
    })
  }

  loadProductData(product:Product) {
    let index = this._productSalesChartData.length + 1;
    let color = '#' + Math.floor(index * 16777215 / 100000 ).toString(16);
    let data1:any = this.getDefaultDataset(), data2:any = this.getDefaultDataset();
    data1.label = product.data.name;
    data1.backgroundColor = data1.borderColor = data1.pointBorderColor = data1.pointHoverBackgroundColor = color;
    data2.label = product.data.name;
    data2.backgroundColor = data2.borderColor = data2.pointBorderColor = data2.pointHoverBackgroundColor = color;
    let chartData1 = [], chartData2 = [];
    for(let d of this.lineChartLabels) {
      let sales = this.sales_data.filter(item => this.getFormattedDate(item.created_at, this.interval) == d);
      let sum = 0; let solds = 0;
      for(let s of sales) {
        let products = s.products.filter(item => item.product_id == product._id);
        sum += products.reduce((a, b)=> a + b.discountedTotal, 0);
        solds += products.reduce((a, b)=> a + b.qty, 0);
      }      
      chartData1.push(sum);
      chartData2.push(solds);      
    }
    data1.data = chartData1;
    data2.data = chartData2;
    this._productSalesChartData.push(data1);
    this._productOrdersChartData.push(data2);    
  }

  setSalesChartData() {    
    if(this.sales_mode == 'sales') {
      this.salesChartData = [...this._salesChartData];
      this.salesChartLabel = 'Sales';
      this.salesBackColor = 'rgba(30,136,229,0.4)';
      this.salesBorderColor = 'rgba(30,136,229,1)';      
    } else {
      this.salesChartData = [...this._ordersChartData];
      this.salesChartLabel = 'Orders';
      this.salesBackColor = 'rgba(75,192,192,0.4)';
      this.salesBorderColor = 'rgba(75,192,192,1)';
    }     
    if(this.salesChart) {
      this.salesChart.data = this.salesChartConfigData;      
      this.salesChart.update();   
    }
  }

  setProductsChartData() {
    if(this.product_mode == 'sales') {
      this.productChartData = [...this._productSalesChartData];            
    } else {
      this.productChartData = [...this._productOrdersChartData];            
    }
    if(this.productChart) {
      this.productChart.data = this.productChartConfigData;      
      this.productChart.update();   
    }
  }

  getAllRangeDates(startDate, endDate) {
    const interval = 1000 * 60 * 60 * 24; // 1 day
    const duration = endDate - startDate;
    const steps = duration / interval;
    return Array.from({length: steps+1}, (v,i) => new Date(startDate.valueOf() + (interval * i)));
  }

  public get total_sales():string {
    let sum = 0;
    for(let s of this._salesChartData) {
      if(typeof s == 'number') {
        sum += s;
      }
    }    
    return this.util.getPriceWithCurrency(sum);
  }

  public get total_orders():number {
    let sum = 0;
    for(let s of this._ordersChartData) {
      if(typeof s == 'number') {
        sum += s;
      }
    }
    return sum;
  }

  public get total_product_sales():string{
    let sum = 0;
    for(let d of this._productSalesChartData) {
      for(let s of d.data) {
        if(typeof s == 'number') {
          sum += s;
        }
      }
    }
    return this.util.getPriceWithCurrency(sum);
  }
  public get total_product_orders():number {
    let sum = 0;
    for(let d of this._productOrdersChartData) {
      for(let s of d.data) {
        if(typeof s == 'number') {
          sum += s;
        }
      }
    }
    return sum;
  }

  async openSettings() {
    const popover = await this.popoverController.create({
      component: ChartSettingsComponent,
      // event: ev,
      cssClass: 'popover_custom fixed-width',      
      translucent: true,
      componentProps: {interval: this.interval, date_from: this.date_from, date_to: this.date_to}
    });

    popover.onDidDismiss().then(result => {      
      if(typeof result.data != 'undefined') {        
        let data = result.data;
        let df = this.util.handleDate(data.date_from);
        let dt = this.util.handleDate(data.date_to);
        if(data.interval != this.interval || df != this.date_from || dt != this.date_to) {
          this.interval = data.interval;
          this.date_from = df
          this.date_to = dt;
          this.loadData();
        }
      }
    });

    await popover.present();    
  }

  getFormattedDate(current_date:any, period:string='daily'):string {
    let d = new Date(current_date);    
    let year = d.getFullYear(), month = ('0' + (d.getMonth() + 1)).substr(-2), date = ('0' + d.getDate()).substr(-2);
    if(period == 'daily') {
      return [year, month, date].join('-');
    } else if(period == 'monthly') {
      return [year, month].join('-');
    } else {
      return year.toString();
    }
  }

}
