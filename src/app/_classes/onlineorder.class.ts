import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import { CartProduct } from './cart_product.class';
import { Product } from './product.class';
import * as UtilFunc from '../_helpers/util.helper';
import { Store } from './store.class';
import { Constants } from '../_configs/constants';

export interface IPayment {
	type: string,
	amount:number,
	created_at: string,
}

interface IStatusHistory{
	status: string,
	created_at: string
}

interface ICustomer{
	name:string,
	email:string,
	mobile:string,
	company:string,
	billing_address:{
		street:string,
		city:string,
		suburb:string,
		postcode:string,
		state:string,
		country:string
	},
	shipping_address:{
		street:string,
		city:string,
		suburb:string,
		postcode:string,
		state:string,
		country:string
	}
}

@Injectable({
  providedIn: 'root'
})
export class Onlineorder{			
	_id: string = '';
	private_web_address: string = '';	
	outlet: any = null;
	register: any = null;
	reference: string = '';	
	products: CartProduct[] = [];
	payments: IPayment[] = [];
	status: string = '';	
	status_history:IStatusHistory[] = [];
	payment_status: string = '';	
	payment_status_history:IStatusHistory[] = [];
	note: string = '';
	customer: ICustomer;
	tax:number = 0;
	change:number = 0;
	created_at: string = '';
	discount: {
			mode: string,
			value: number
	};    
	
	util = UtilFunc;	
	user:any;
	store_info:Store;
	main_outlet:any = null;

	constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	

		this.user = this.authService.getCurrentUser;
		this.store_info = new Store(this.authService, this.utilService);
		this.store_info.load();
		this.utilService.get('sell/outlet', {is_main: true}).subscribe(result => {
      if(result && result.body) {
        this.main_outlet = result.body[0];
      }
    })
		
		if(this.user) {
			this.utilService.get('auth/user?_id=' + this.user._id).subscribe(result => {
				this.user.outlet = result.body.outlet;        
			})
		}

		this.init();
	}

	init() {
		this._id = '';  	
		this.reference = this.util.genRandomOrderString(8);		
		this.products = [];
		this.payments = [];
		this.status = 'awaiting';
		this.status_history = [];
		this.payment_status = 'not_paid';
		this.payment_status_history = [];
		this.note = '';
		this.customer = {
			name: '',
			email: '',
			mobile: '',
			company: '',
			billing_address: {
				street: '',
				city: '',
				suburb: '',
				postcode: '',
				state: '',
				country: null
			},
			shipping_address: {
				street: '',
				city: '',
				suburb: '',
				postcode: '',
				state: '',
				country: null
			}
		};
		this.tax = 0;
		this.change = 0;
		this.discount = {mode: 'percent',	value: 0};
	}

	loadById(_id:string, success?:Function, no_exist?:Function) {
		this.utilService.get('sale/order', {_id: _id}).subscribe(result => {
			if(result && result.body) {
				this.loadDetails(result.body);
				if(success) success();
			} else {
				if(no_exist) no_exist();
			}
		}, error => {
			if(no_exist) no_exist();
		})
	}

	loadDetails(order: any) {		
		this.init();
		this._id = order._id;
		this.reference = order.reference;
		this.payments = order.payments;
		this.status = order.status;		
		this.status_history = order.status_history;
		this.payment_status = order.payment_status;
		this.payment_status_history = order.payment_status_history;		
		this.tax = order.tax;
		this.discount = order.discount;		
		this.customer = order.customer;
		this.note = order.note;		
		for(let p of order.products) {
			let product:Product = null;
			if(p.product_id) {
				product = new Product(this.authService, this.utilService);
				product.loadDetails(p.product_id);
			}
			let cart_product = new CartProduct(product, p.variant_id);
			cart_product.loadDetails(p);
			this.products.push(cart_product);
		}
		if(order.created_at) {
			this.created_at = order.created_at;
		}		
		this.change = order.change;		
		this.setGlobalDiscount();
	}

	addProduct(product: CartProduct, qty:number=1) {
		let index = this.products.findIndex(item => {
      return item.product_id == product.product_id && item.variant_id == product.variant_id
    });    
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

	pay(pay_mode: string, amount:number, created_at?:string) {		
		let payment: IPayment = {
			type: pay_mode,
			amount: amount,
			created_at: created_at?created_at:(new Date()).toString()
		};				
		this.payments.push(payment);	
		if(this.total_paid >= this.totalIncl)	{
			this.status_history.push({
				status: 'allocated',
				created_at: (new Date()).toString()
			});
			this.status = 'allocated';
			this.payment_status_history.push({
				status: 'full_paid',
				created_at: (new Date()).toString()
			})
			this.payment_status = 'full_paid';
		} else {
			this.payment_status_history.push({
				status: 'partial_paid',
				created_at: (new Date()).toString()
			})
			this.payment_status = 'partial_paid';
		}
	}

	removePayment(index: number) {
		this.payments.splice(index, 1);
	}

	save(callback?:Function, error?:Function) {		
		const data = this.orderData; 
		if(!data.created_at) {
			delete data.created_at;
		}
		if(this._id) {					
			this.utilService.put('sale/order', data).subscribe(result => {					
				if(callback) callback(result);
			}, err => {
				if(error) error(err);
			})   	
		} else {
			delete data._id;
			this.utilService.post('sale/order', data).subscribe(result => {	
				this._id = result.body._id;				
				if(callback) callback(result);
			}, err => {
				if(error) error(err);
			})   	
		}
	}

	delete(callback?:Function, error?:Function) {		
		this.utilService.delete('sale/order?_id=' + this._id).subscribe(result => {			
			if(callback) callback(result);
		}, err => {
			if(error) error(err);
		})
	}

	getCustomerData():ICustomer {
		if(this.customer) {
			let data:ICustomer = {
				name: this.customer.name,
				email: this.customer.email,
				mobile: this.customer.mobile,
				company: this.customer.company,
				billing_address: {
					street: this.customer.billing_address.street,
					city: this.customer.billing_address.city,
					suburb: this.customer.billing_address.suburb,
					postcode: this.customer.billing_address.postcode,
					state: this.customer.billing_address.state,
					country: this.customer.billing_address.country ? this.customer.billing_address.country: null
				},
				shipping_address: {
					street: this.customer.billing_address.street,
					city: this.customer.shipping_address.city,
					suburb: this.customer.shipping_address.suburb,
					postcode: this.customer.shipping_address.postcode,
					state: this.customer.shipping_address.state,
					country: this.customer.shipping_address.country ? this.customer.shipping_address.country: null
				}
			};
			return data;
		} else {
			return null;
		}
		
	}
	
	public get orderData():any {		
		const data = {
			_id: this._id,
			private_web_address: this.store_info.private_web_address,
			outlet: this.user ? this.user.outlet._id : (this.main_outlet ? this.main_outlet._id : null),
			register: this.user ? this.user.outlet.register[0] : (this.main_outlet ? this.main_outlet.register[0]._id : null),
			payments: this.payments,
			status: this.status,
			status_history: this.status_history,
			payment_status: this.payment_status,
			payment_status_history: this.payment_status_history,
			note: this.note,
			customer: this.getCustomerData(),
			total: this.totalIncl,
      subtotal: this.subTotal, 
      total_items: this.total_items,
			tax: this.taxAmount,
			discount: this.discount,
			total_paid: this.total_paid,
			change: this.change,
			created_at: this.created_at,
			products: [],
			reference: this.reference			
		};				

		for(let product of this.products) {
			data.products.push(product.getProduct());
		}
		return data;
	}

	getProductTax(product:any) {
		let tax = 0;        
			if(product.tax && product.tax.rate){
				tax = product.tax.rate;
			}        
		return tax;
	}

	public get isOutletTax():boolean {
		let f = false;
		if(this.store_info && this.store_info.default_tax == 'outlet') {      
		f = true;
		}
		return f;
	}
	
	public get discount_str(): string {  //getDiscount()
		let str = '';
		if(this.discount.mode === 'percent') {			
			str = this.util.getPriceWithCurrency(-this.subTotal * this.discount.value / 100);			
		} else {
			str = this.util.getPriceWithCurrency(-this.discount.value);
		}
		return str;
	}

	public get discount_rate(): string {  //getDiscount()
		let str = '';
		if(this.discount.mode === 'percent') {						
			str = '(-' + Math.abs(this.discount.value).toFixed(2) + '%)';
		}
		return str;
	}

	public get total_items(): number { //getItemCount
		return this.products.reduce((a, b) => a + b.qty, 0);
	}

	public get totalWithoutDiscount():number {
		const sum = this.products.reduce((a, b) => a + b.qty * b.price, 0);
		return parseFloat(sum.toFixed(2));
	}

	public get totalExcl(): string { //getTotalExcl
		let subtotal = this.subTotal;
		if(subtotal>0) {
			if (this.discount.mode === 'percent') {
				subtotal = subtotal - parseFloat((subtotal * this.discount.value / 100).toFixed(2));
			} else {
				subtotal = subtotal - this.discount.value;
			}    
		}
		return subtotal.toFixed(2);
	}

	public get totalIncl(): number{ //getTotalIncl
		let total_excl = parseFloat(this.totalExcl);
		let total_tax = total_excl>0?parseFloat(this.taxAmount): 0;
		return parseFloat((total_excl + total_tax).toFixed(2));
	}

	public get totalIncl_str(): string{
		return this.util.getPriceWithCurrency(this.totalIncl);
	}

	public get subTotal(): number { //getSubTotal()
		let sum = 0;
		for(let product of this.products){
			sum += product.discountedTotalWithoutGlobal;
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
				let p = product.discountedTotal;
				sum += parseFloat((p * product.tax / 100).toFixed(2));
			}
		} else {
			if(parseFloat(this.totalExcl)>0) {
				let tax = this.user ? this.user.outlet.defaultTax.rate : (this.main_outlet ? this.main_outlet.defaultTax.rate : 0);      
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
		if(this.isOutletTax) {
			let tax_rate = this.user ? this.user.outlet.defaultTax.rate : (this.main_outlet ? this.main_outlet.defaultTax.rate : 0);
			return '(+' + tax_rate.toFixed(2) + '%)';
		}
		return '';
	}

	public getPaymentType(payment:IPayment):string {
		if(payment.type == 'cash') {
			return 'Cash';
		} else if(payment.type == 'store_credit') {
			return 'Store Credit';
		} else if(payment.type == 'store_pickup') {
			return 'Store Pickup';
		} else if(payment.type == 'paypal') {
			return 'Paypal';
		} else if(payment.type == 'stripe') {
			return 'Stripe';
		} else {
			return this.util.toUppercase(payment.type) + ' Card';
		}
	}

	// public get change(): string {
	// 	let a = 0;
	// 	if(this.total_paid > this.totalIncl) {
	// 		 a = this.total_paid - this.totalIncl;
	// 	}
	// 	return a.toFixed(2);
	// }

	public get total_paid(): number {
		let sum = 0;		
		for(let payment of this.payments) {
			sum += payment.amount;
		}		
		return sum;
	}

	public get discount_symbol(): string {
		if(this.discount.mode == 'percent') {
			return '%';
		} else {
			return '$';
		}
	}

	getStatus(status:string):string {
		let result = 'Unknown';
		let index = Constants.order_status.findIndex(item => item.code == status);
		if(index>-1) result = Constants.order_status[index].label;
		return result;
	}

	public get status_str():string {		
		return this.getStatus(this.status);
	}

	getPaymentStatus(status:string):string {
		let result = 'Unknown';
		let index = Constants.payment_status.findIndex(item => item.code == status);
		if(index>-1) result = Constants.payment_status[index].label;
		return result;
	}

	public get payment_status_str():string {		
		return this.getPaymentStatus(this.payment_status);
	}

	setGlobalDiscount() {
    let rate = this.discount.value;
    if(this.discount.mode == 'amount') {
      rate = this.discount.value * 100 / this.subTotal;
    } 
    for(let product of this.products) {
      product.global_discount = rate;
      product.discount.mode = this.discount.mode;
    }
  }

	public get payment_type():string {
		if(this.payments.length>0) {
			return this.getPaymentType(this.payments[this.payments.length-1]);
		}
		return '';
	}
}