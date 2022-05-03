import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import { CartProduct } from './cart_product.class';
import { Product } from './product.class';
import { Constants } from '../_configs/constants';
import * as UtilFunc from '../_helpers/util.helper';
import { Customer } from './customer.class';
import { Store } from './store.class';
import { Bundle } from "./bundle.class";
import { Payment } from './payment.class';

export interface IPayment {
	type: string,
	amount:number,
	created_at: string
}

export interface IBundleProduct{
	bundle: Bundle,
	cart_products: CartProduct[],
	qty: number
}

@Injectable({
  providedIn: 'root'
})
export class Cart{			
	_id: string = '';
	id_cart: string = '';
	sale_number:string = '';  
	products: CartProduct[] = [];
	payments: IPayment[] = [];
	voided_payments: IPayment[] = [];
	payment_status: string = 'not paid';
	sale_status: string = 'new';    
	origin_status: string = '';
	note: string = '';
	customer: Customer;
	tax:number = 0;
	created_at: string = '';
	discount: {
			mode: string,
			value: number
	};    
	fulfillment: {
		mode: string,
		customer: any,
		email: string,
		mobile: string,
		phone: string,
		fax: string
	};
	voided: boolean = false;
	returned: boolean = false;
	cart_mode: string = 'new';
	origin_customer: string = '';
	origin_sale_number:string = '';

	util = UtilFunc;
	all_products:CartProduct[] = [];
	main_outlet: any;
	user: any;  
	store_info: Store = null;
	allBundles:Bundle[] = [];    	
	bundle_products:IBundleProduct[] = [];	
	register_obj:any = null;

	constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	

		this.user = this.authService.getCurrentUser;
		this.store_info = new Store(this.authService, this.utilService);
		this.store_info.load();

		if(this.user) {
			this.utilService.get('auth/user?_id=' + this.user._id).subscribe(result => {
				this.user.outlet = result.body.outlet;        
			})
		}
		
		this.utilService.get('sell/outlet', {is_main: true}).subscribe(result => {
			if(result && result.body) {
				this.main_outlet = result.body[0];
			}
		})

		this.utilService.get('product/bundle', {active: true}).subscribe(result => {
			if(result && result.body) {
					for(let b of result.body) {
							let bundle = new Bundle(this.authService, this.utilService);
							bundle.loadDetails(b);
							this.allBundles.push(bundle);
					}
			}            
		})

		this.init();
	}

	init() {
		this._id = '';
		this.sale_number = this.util.genRandomOrderString(8);		
		this.products = [];
		this.payments = [];
		this.voided_payments = [];
		this.payment_status = 'not paid';
		this.sale_status = 'new';    
		this.origin_status = '';
		this.origin_customer = '';
		this.note = '';
		this.customer = null;
		this.tax = 0;
		this.discount = {mode: 'percent',	value: 0};
		this.origin_sale_number = '';
		this.voided = false;
		this.returned = false;

		this.fulfillment = {mode: 'dilivery', customer: null,	email: '',	mobile: '',	phone: '', fax: ''};
		this.cart_mode = 'new';
		this.bundle_products = [];
		this.register_obj = null;
	}

	loadCurrent(success?:Function, noexist?:Function) {
		const data = {
      private_web_address: this.store_info.private_web_address,
			user_id: this.user._id
    };
		this.utilService.get('sell/cart', data).subscribe(result => {			
			if(result && result.body) {
				const cart = result.body;				
				this.id_cart = cart._id;
				if(cart.sale) {
					this.loadByCart(cart.sale);
					if(success) success(this);
				} else {
					if(noexist) noexist();
				}
			} else {				
				if(noexist) noexist();
			}
		}, error => {
			if(noexist) noexist();
		});
	}

	loadFromSale(id_sale:string, success?:Function, noexist?:Function) {				
		this.utilService.get('sale/sale', {_id: id_sale}).subscribe(result => {  
			if(result && result.body) {				
				if(success) success(result.body);
			} else {				
				if(noexist) noexist();
			}
		}, error => {
			if(noexist) noexist();
		});
	}

	loadByCart(cart: any) {	
		this._id = cart._id;
		this.sale_number = cart.sale_number;
		this.payments = cart.payments;
		this.voided_payments = cart.voided_payments;
		this.payment_status = cart.payment_status;
		this.sale_status = cart.sale_status;
		this.tax = cart.tax;
		this.discount = cart.discount;
		if(cart.customer) {
			this.customer = new Customer(this.authService, this.utilService);
			this.customer.loadDetails(cart.customer);			
		} else {
			this.customer = null;
		}		
		if(cart.origin_status) this.origin_status = cart.origin_status;
		this.note = cart.note;
		if(cart.fulfillment) {
			this.fulfillment = {...cart.fulfillment};
		}
		this.products = [];
		for(let p of cart.products) {
			let product:Product = null;
			if(p.product_id) {
				product = new Product(this.authService, this.utilService);
				product.loadDetails(p.product_id);
			}
			let cart_product = new CartProduct(product, p.variant_id);
			cart_product.loadDetails(p);
			this.products.push(cart_product);
		}
		if(cart.created_at) {
			this.created_at = cart.created_at;
		}
		if(cart.cart_mode) {
			this.cart_mode = cart.cart_mode;
		}
		this.origin_customer = cart.origin_customer;	
		this.origin_sale_number = cart.origin_sale_number;	
		if(typeof cart.voided != 'undefined') {
			this.voided = cart.voided;
		}
		if(typeof cart.returned != 'undefined') {
			this.returned = cart.returned;
		}
		this.setGlobalDiscount();
		this.getBundleProducts();
		this.register_obj = cart.register;
	}

	addProduct(product: CartProduct, qty:number=1) {
		let index = this.products.findIndex(item => {
      return item.product_id == product.product_id && item.variant_id == product.variant_id
    });    
		if(product.product.data.minus_price) {
			product.sign = -1;
		}
		if(product.product.data.scale_product) {
			product.blank_cup_weight = product.product.data.blank_cup_weight;
		}
		if(index > -1) {
			this.products[index].qty += qty;  
		} else {
			product.qty = qty;
			this.products.push(product);
		}
	}

	removeProduct(index: number) {
		let product = this.products[index];
		product.qty = 0;
		this.products.splice(index, 1);
	}

	save(callback?:Function) {		
		const data = this.saleData; 				
		if(!data._id) {
			delete data._id;
			delete data.created_at;
		}
    this.utilService.post('sale/sale', data).subscribe(result => {	
			const cart = result.body;
			let saved_cart = this._id == cart._id;
			this._id = cart._id;
			this.payments = cart.payments;
			this.voided_payments = cart.voided_payments;
			this.getBundleProducts();
			if(!saved_cart || this.isVoid) {				
				this.utilService.post('sell/cart', this.cartData).subscribe(cart => {
					this.id_cart = cart.body._id;					
					this._saveCallback(callback);
				})
			} else {
				this._saveCallback(callback);
			}
    })   
	}

	_saveCallback(callback?:Function) {
		if(this.sale_status == 'return_completed') {
			this.utilService.post('sale/set_returned_sale', {sale_number: this.origin_sale_number}).subscribe(result => {
				if(callback) callback(result);		
			})
		} else {
			if(callback) callback();
		}
	}

	delete(callback?:Function) {		
		if(this.id_cart) {
			this.utilService.put('sell/cart', {_id: this.id_cart, sell: null}).subscribe(result => {			
				if(callback) callback(result);
			})
		} 		
	}

	deleteSale(callback?:Function) {
		if(this._id) {
			this.utilService.delete('sale/sale?_id=' + this._id).subscribe(result => {			
				this.delete(callback)
			})
		}
	}

	public get cartData():any {
		const data = {
			_id: this.id_cart,
			private_web_address: this.store_info.private_web_address,
			user_id: this.user._id,
			sale: this._id
		}
		if(!this.id_cart) delete data._id;
		return data;
	}
	
	public get saleData():any {		
		const data = {
			user_id: this.user?this.user._id:null,			
			private_web_address: this.store_info.private_web_address,
			store_name: this.store_info.store_name,
			outlet: (this.user && this.user.outlet) ? this.user.outlet._id : this.main_outlet._id,
			register: null,
			payments: this.payments,
			voided_payments: this.voided_payments,
			payment_status: this.payment_status,
			sale_status: this.sale_status,
			note: this.note,
			customer: this.customer ? this.customer._id: null,
			total: this.totalIncl,
      subtotal: this.subTotal, 
      total_items: this.total_items,
			tax: this.taxAmount,
			discount: this.discount,
			total_paid: this.total_paid,
			change: this.change,
			created_at: this.created_at,
			origin_status: this.origin_status,
			origin_customer: this.origin_customer,
			origin_sale_number: this.origin_sale_number,
			cart_mode: this.cart_mode,
			voided:this.voided,
			returned: this.returned,
			products: [],
			fulfillment: {},
			_id: this._id,
			sale_number: this.sale_number,
		};				
		if(this.register_obj) {
			data.register = this.register_obj._id;
		} else if (this.user && this.user.outlet) {
			data.register = this.user.outlet.register[0];
		} else { 
			data.register = this.main_outlet.register[0];
		}

		const fulfillment = {
			mode: this.fulfillment.mode,
			customer: (this.fulfillment.customer) ? this.fulfillment.customer._id: null,
			email: this.fulfillment.email,
			mobile: this.fulfillment.mobile,
			phone: this.fulfillment.phone,
			fax: this.fulfillment.fax
		}
		data.fulfillment = fulfillment;

		for(let product of this.products) {
			data.products.push(product.getProduct());
		}
		return data;
	}

	public get isOutletTax():boolean {
    let f = false;
    if(this.store_info && this.store_info.default_tax == 'outlet') {      
      f = true;
    }
    return f;
  }

	getProductTax(product:any) {
    let tax = 0;    
    if(this.isOutletTax) {
      let outlet = this.user ? this.user.outlet : null;
      if(outlet && outlet.defaultTax && outlet.defaultTax.rate)
        tax = this.user.outlet.defaultTax.rate;
    } else {      
      if(product.tax && product.tax.rate){
        tax = product.tax.rate;
      }
    }    
    return tax;
  }
	
	public get discountItems(): number {
		let sum = this.products.reduce((a, b) => a + b.discountAmount, 0);
		return parseFloat(sum.toFixed(2));
	}

	public get discountItems_str(): string {		
		return this.util.getPriceWithCurrency(this.discountItems);
	}

	public get total_discount_sale():number {
		let sum = 0;
    if(this.discount.mode === 'percent') {			
      sum = this.subTotal * this.discount.value / 100;
    } else {
      sum = this.discount.value;
    }
		return parseFloat(sum.toFixed(2));
	}
	
  public get discount_str(): string {  //getDiscount()    
    return this.util.getPriceWithCurrency(-this.total_discount_sale);
  }

	public get discount_rate(): string {
		let str = '';
    if(this.discount.mode === 'percent' && this.discount.value>0) {			      
      str = '(-' + Math.abs(this.discount.value).toFixed(2) + '%)';
    } 
    return str;
	}

  public get total_items(): number { //getItemCount
    return this.products.reduce((a, b) => a + b.qty, 0);
  }

	public get totalWithoutDiscount():number {
		const sum = this.products.reduce((a, b) => a + (!b.voided ? b.qty * b.price:0), 0);
		return parseFloat(sum.toFixed(2));
	}

	public get totalWithoutDiscount_str():string {
		return this.util.getPriceWithCurrency(this.totalWithoutDiscount);
	}

  public get totalExcl(): string { //getTotalExcl
    let subtotal = this.subTotal;
    if (this.discount.mode === 'percent') {
      subtotal = subtotal - parseFloat((subtotal * this.discount.value / 100).toFixed(2));
    } else {
      subtotal = subtotal - this.discount.value;
    }    
		subtotal -= this.total_bundle_discount;
    return subtotal.toFixed(2);
  }

  public get totalIncl(): number{ //getTotalIncl
    let total_excl = parseFloat(this.totalExcl);
    let total_tax = parseFloat(this.taxAmount);
    return parseFloat((total_excl + total_tax).toFixed(2));
  }

	public get totalIncl_str(): string{
		return this.util.getPriceWithCurrency(this.totalIncl);
	}

  public get subTotal(): number { //getSubTotal()
    let sum = 0;
    for(let product of this.products){
			if(!product.voided) sum += product.discountedTotalWithoutGlobal;
    }    
    return sum;
  }

	public get subTotal_str():string {
		return this.util.getPriceWithCurrency(this.subTotal);
	}
	
	public get taxAmount(): string { // getTaxAmount()
    let sum = 0;
		if(!this.isOutletTax) {
			for(let product of this.products) {
				if(!product.voided) {
					let p = product.discountedTotal;
					sum += parseFloat((p * product.tax / 100).toFixed(2));
				}
			}
		} else {
			if(this.user && this.user.outlet && this.user.outlet.defaultTax) {
				let tax = this.user.outlet.defaultTax.rate;      
				sum = parseFloat(this.totalExcl) * tax / 100;
			}
		}			
		return sum.toFixed(2);
  }

	public get taxAmount_str(): string { // getTaxAmount()
    let sum = parseFloat(this.taxAmount), result = '';
		if(sum == 0 && parseFloat(this.totalExcl)!=0) {
			result = 'Free';
		} else {
			result = this.util.getPriceWithCurrency(sum);  
		}    
    return result;
  }

  public get taxRate_str() { // getTaxRateString()
    if(this.isOutletTax && this.user && this.user.outlet && this.user.outlet.defaultTax) {
			if(this.user.outlet.defaultTax.rate) {
				return '(+' + this.user.outlet.defaultTax.rate.toFixed(2) + '%)';
			}
    }
    return '';
  }

	public get total_bundle_discount():number {
		let sum = 0;
		for(let b of this.bundle_products) {
			if(b.bundle) {
				sum += b.qty * b.bundle.discount;
			}
		}
		return parseFloat(sum.toFixed(2));
	} 

	public get total_bundle_discount_str():string {
		return this.util.getPriceWithCurrency(-this.total_bundle_discount);
	}

	public getPaymentType(payment:IPayment):string {
		return Payment.getPaymentLabel(payment.type);
	}

	public get change(): number {
		let a = 0;
		if(this.total_paid > this.totalIncl) {
			 a = this.total_paid - this.totalIncl;
		}
		return parseFloat(a.toFixed(2));
	}

	setGlobalDiscount() {
    let rate = this.discount.value;
    if(this.discount.mode == 'amount') {
      rate = this.discount.value * 100 / this.subTotal;
    } 
    for(let product of this.products) {
      product.global_discount = rate;
      // product.discount.mode = this.discount.mode;
    }
  }

	public get savings(): string {
    return (this.totalWithoutDiscount - parseFloat(this.totalExcl)).toFixed(2);
  }

	public get total_paid(): number {
		let sum = 0;		
		for(let payment of this.payments) {
			sum += payment.amount;
		}		
		for(let payment of this.voided_payments) {
			sum -= payment.amount;
		}
		return sum;
	}

	public get total_to_pay(): number {		
		let a = this.totalIncl - this.total_paid;
		if(!this.isRefund && a<0) a = 0;
		return parseFloat(a.toFixed(2));
	}

	public get payment_step(): boolean {
		return this.payment_status == 'not paid';
	}

	public get discount_symbol(): string {
		if(this.discount.mode == 'percent') {
			return '%';
		} else {
			return '$';
		}
	}

	// public get totalDiscountAmount()

	public get is_manage_sale():boolean {
		if(this.is_new || this.able_to_complete) {
			return false;
		}
		return true;
	}

	public get is_new(): boolean {
		return this._id == '';
	}

	public get able_to_complete(): boolean {
		if(this.products.length>0 && (!this.isRefund && (['layby', 'on_account'].includes(this.payment_status) && this.sale_status == 'new') || this.total_to_pay == 0)) {
			return true;
		}
		return false;
	}

	public get able_to_pay(): boolean {
		if(this.products.length>0 && ((this.isRefund && this.total_to_pay < 0) || (!this.isRefund && this.total_to_pay>0) || 
			(this.isVoid && this.able_to_void))) {
			return true;
		}
		return false;
	}

	public get status_label():string {
		let status = Constants.sale_status.find(item => item.value == this.sale_status);
		let result = '';
		if(status) {
			result = status.label;
			if(this.cart_mode == 'return'){
				if(status.value == 'parked') result += ' Return';			
				if(status.value == 'new') result = 'Return Sale';
			}
		}
		return result;
	}

	pay(pay_mode: string, amount:number) {		
		let payment: IPayment = {
			type: pay_mode,
			amount: amount,
			created_at: new Date().toISOString()
		};
		if(!this.isVoid) this.payment_status = pay_mode;
		if(!['layby', 'on_account'].includes(pay_mode)) {
			if(this.isVoid) {
				this.voided_payments.push(payment);
			} else {
				this.payments.push(payment);
			}
		} 
	}

	saveToSale(sale_status: string, callback?:Function) {
		const data = this.saleData; 		
		if(data.sale_status == 'new' || data.sale_status != sale_status) {
			delete data.created_at;
		}		
		if(sale_status == 'completed') {
			if(data.sale_status == 'layby' || data.sale_status == 'on_account'){
				data.sale_status = data.sale_status + '_completed';
			} else {
				data.sale_status = 'completed';
			}
			if(data.cart_mode == 'return') {
				data.sale_status = 'return_completed';
			}			
		} else {
			data.sale_status = sale_status;
		} 
    this.utilService.post('sale/sale', data).subscribe(result => {			
			this.delete(() => {
				//this.toastService.showSuccess(Constants.message.sale[sale_status]);
				if(callback) callback(result);
			});      
    }, error => {
      //this.toastService.showFailedSave();
    })   
	}

	voidSale(callback?:Function) {
		if(this.sale_status == 'on_account' || this.sale_status.endsWith('completed')) {
			for(let p of this.products) {				
				let pp = new CartProduct(p.product, p.variant_id);
				pp.loadDetails(p);
				pp.qty *= -1;
				pp.updateInventory();
			}
			
			for(let payment of this.payments) {
				if(payment.type == 'store_credit' && this.customer) {
					this.customer.data.credit += payment.amount;					
				}
			}
			if('on_account' == this.sale_status && this.customer) {
				this.customer.data.debit -= this.totalIncl;
			}
			if(this.customer) this.customer.save();
		} 		
		this.voided = true;
		this.save(callback);		
	}

	public get isVoid():boolean {
		return this.cart_mode == 'void';
	}

	public get isVoidedSale():boolean {
		let f = true;
		for(let p of this.products){
			f = f && p.voided;
		}
		return this.voided || f;
	}

	public get able_to_void():boolean {
		let result = false;
		for(let p of this.products) {
			if(p.void) {
				result = true;
				break;
			}
		}
		return result;
	}

	public get voided_amount():number {
		let pay_amount = 0;
		for(let product of this.products) {
			if(product.void) {
				product.voided = true;
				let p = product.discountedTotal;
				if(!this.isOutletTax) {
					pay_amount += parseFloat((p * product.tax / 100).toFixed(2));
				} else {
					pay_amount += p;
				}
			}
		}
		if(this.isOutletTax) {
			if(this.user && this.user.outlet && this.user.outlet.defaultTax) {
				let tax = this.user.outlet.defaultTax.rate;      
				pay_amount = pay_amount * (1 + tax / 100);
			}
		}
		return pay_amount;
	}

	setRefund() {
		this.sale_status = 'new';
		this.payments = [];
		this.discount.value *= -1;
		for(let product of this.products) {
			product.qty *= -1;
			product.discount.value *= -1;
		}
	}

	public get isRefund():boolean {
		return this.cart_mode == 'return';
	}

	public getReceivedPayments(type:string):number {
		return this.payments.reduce((a, b) => a + (b.type == type ? b.amount : 0), 0);
	}

	public get voidedAmount():number {
		return this.voided_payments.reduce((a, b) => a + b.amount, 0);
	}

	public get voidedAmount_str():string {
		return this.util.getPriceWithCurrency(this.voidedAmount);
	}

	checkInStock(product:Product) {
		if(!product.data.tracking_inv) {
			return true;
		} else {
			if(product.data.variant_inv) {
				for(let vp of product.data.variant_products) {
					let index = this.products.findIndex(item => item.product_id == product._id && item.variant_id == vp._id);					
					if(index > -1) {						
						if(vp.inventory > this.products[index].qty) return true;
					}
				}
				return true;
			} else {
				let index = this.products.findIndex(item => item.product_id == product._id);
				if(index > -1) {
					return product.data.inventory > this.products[index].qty;
				}
			}
		}
		return true;
	}

	getCurrentQty(cartProduct:CartProduct):number {
		let index = this.products.findIndex(item => item.product_id == cartProduct.product_id && item.variant_id == cartProduct.variant_id);
		if(index > -1) {
			return this.products[index].qty;
		}
		return 0;
	}

	public getBundleProducts() {
		let bundleProduct: IBundleProduct[] = [];		
		let singleProduct: IBundleProduct[] = [];
		for(let bundle of this.allBundles) {
				let bp:IBundleProduct[] = this.getBundleCartProduct(bundleProduct, bundle);
				if(bp.length>0) {
						bundleProduct = bundleProduct.concat(bp);
				}
		}
		for(let p of this.products) {
				let qty = this.getSingleProductQty(bundleProduct, p);
				if(qty>0) {
						let product = new CartProduct(p.product, p.variant_id);
						product.loadDetails(p.getProduct());
						product.qty = qty;
						let bp:IBundleProduct = {
							bundle: null,
							cart_products: [product],
							qty: qty
						}
						singleProduct.push(bp);
				}				
		}		
		this.bundle_products = bundleProduct.concat(singleProduct);
	}

	public getSelectedBundleProduct():CartProduct {
		let result:CartProduct = null;
		for(let b of this.bundle_products) {
			result = b.cart_products.find(item => item.checked);
			if(result) break;
		}
		return result;
	}

	public deSelectOtherBundleProducts(product:CartProduct) {
		for(let b of this.bundle_products) {
			for(let p of b.cart_products) {
        if(p !== product) p.checked = false;
      }
		}
	}

	private getSingleProductQty(bundleProducts:IBundleProduct[], cart_product:CartProduct) {
		let qty = cart_product.qty;
		for(let bundle of bundleProducts) {
			let pp = bundle.cart_products.filter(item => item.product_id == cart_product.product_id && item.variant_id == cart_product.variant_id);
			for(let p of pp) qty -= p.qty;
		}
		return qty;
	}

	private getBundleCartProduct(bundleProducts:IBundleProduct[], bundle: Bundle):IBundleProduct[] {        
		let result:IBundleProduct[] = [];
		let qty = 0, cart_products:CartProduct[] = [], i = 0;
		for(let p of bundle.products) {            
			let index = this.products.findIndex(item => item.product_id == p.product._id && item.variant_id == p.variant_id);
			if(index > -1) {                
				let p:CartProduct = this.products[index];
				let q = this.getSingleProductQty(bundleProducts, p);
				let qq = 0;
				if(q >= bundle.count) {
					qq = Math.floor(q/bundle.count);
					let c_products:CartProduct[] = [];
					for(let i=0;i<bundle.count;i++) {
						let product = new CartProduct(p.product, p.variant_id);
						product.loadDetails(p.getProduct());
						product.qty = qq;
						c_products.push(product);
					}
					let bCartProduct:IBundleProduct = {
						bundle: bundle,
						cart_products: c_products,
						qty: qq
					}
					result.push(bCartProduct);
				}
				let q3 = q - qq * bundle.count;
				if(q3 > 0) {
					let product = new CartProduct(p.product, p.variant_id);
					product.loadDetails(p.getProduct());
					product.qty = q3;
					cart_products.push(product);
					qty += q3;
				}
			}
		}
		if(qty>=bundle.count) {
			let qty = 0; let c_products:CartProduct[] = [];
			for(let i=0;i<cart_products.length;i++) {
				let p = cart_products[i];
				qty += cart_products[i].qty;				
				if(qty<bundle.count) {
					c_products.push(cart_products[i]);
				} else {
					let product = new CartProduct(p.product, p.variant_id);
					product.loadDetails(p.getProduct());
					let qq = qty - bundle.count;
					product.qty = p.qty - qq;
					c_products.push(product);
					let bCartProduct:IBundleProduct = {
						bundle: bundle,
						cart_products: [...c_products],
						qty: 1
					}
					result.push(bCartProduct);
					qty = 0; c_products = [];
					let product1 = new CartProduct(p.product, p.variant_id);
					product1.loadDetails(p.getProduct());
					product1.qty = qq;
					c_products.push(product1);
				}
			}
		}
		return result;
	}

	getProductsFromBundle(cart_product:CartProduct):CartProduct {
		let result:CartProduct = null;
		if(cart_product) {
      let index = this.products.findIndex(item => item.product_id == cart_product.product_id && item.variant_id == cart_product.variant_id);
      if(index>-1) result = this.products[index];
    }
		return result;
	}

}