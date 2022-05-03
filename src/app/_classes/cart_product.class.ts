import { UtilService } from '../_services/util.service';
import { Product } from './product.class';
import * as UtilFunc from '../_helpers/util.helper';

export interface ICartProduct {
    product_id: string;
    variant_id: string;
    product_name: string;
    variant_name: string;
    qty: number;
	sign: number;
    discount: {
      mode: string,
      value: number
    };
    note: string;
    price:number;
    tax: number;  
	voided: boolean;	
	blank_cup_weight: number;
	weight: number;
	serial: string;
}
  
export class CartProduct{
	product_id: string = '';
	variant_id: string = '';
	qty: number = 0;
	discount: {
		mode: string,
		value: number
	};
	note: string = '';
	prompt_price: number = 0;
	product: Product = null;
	global_discount:number = 0;
	sign = 1;
	blank_cup_weight:number = 0;
	weight:number = 0;
	utilService: UtilService;
	util = UtilFunc;
	checked: boolean = false;
	voided: boolean = false;
	void: boolean = false;
	serial: string = '';	

	public constructor(product:Product, variant_id?:string) {
		this.product = product;
		if(variant_id) this.variant_id = variant_id;
		this.product_id = product._id;
		this.discount = {mode: 'percent', value: 0};
	}

	loadDetails(data:ICartProduct) {
		this.qty = data.qty;
		if(!data.sign) data.sign = 1;
		this.sign = data.sign;
		this.discount = {...data.discount};
		this.note = data.note;		
		this.voided = data.voided;
		this.prompt_price = data.price;
		this.blank_cup_weight = data.blank_cup_weight;
		this.weight = data.weight;
		this.serial = data.serial;		
	}

	public get discount_symbol(): string {
		if(this.discount.mode == 'percent') {
			return '%';
		} else {
			return '$';
		}
	}

	public get product_name():string {
		if(this.product){
			return this.product.data.name;
		} 
		return '';
	}

	public get variant_product():any {
		if(this.product && this.variant_id) {
			let index = this.product.data.variant_products.findIndex(item => item._id == this.variant_id);
			if(index>-1) {
				return this.product.data.variant_products[index];
			}
		}
		return null;
	}

	public get variant_name():string {
		if(this.variant_product) {
			return this.variant_product.name;
		}
		return '';
	}

	public get price():number {
		let price = 0;
		if(!this.product.data.has_no_price) {
			price = this.product_price;		
			if(price==0 && this.product.data.price_prompt) {
				price = this.prompt_price;
			}
		}
		return price;
	}

	public get product_price():number {
		let price = 0;
		if(!this.product.data.has_no_price) {
			if(this.variant_product) {
				price = this.variant_product.retail_price;
			} else {
				if(this.product) price = this.product.data.retail_price;
			}		
		}
		return price;
	}	

	public get price_str():string {
		if(this.product.data.has_no_price) {
			return '';
		}
		return this.util.getPriceWithCurrency(this.price);
	}

	public get totalPrice_str():string {
		if(this.product.data.has_no_price) {
			return '';
		}
		let p = this.price * this.qty * this.sign;
		return this.util.getPriceWithCurrency(p);
	}

	public get tax():number {
		if(this.product) {
			return this.product.data.tax.rate;
		}
		return 0;
	}	

	public get totalInclTax():number { //getTotalInclTax
		let p = this.discountedTotal;
		return p * (1 + this.tax / 100);
	}

	public get totalInclTax_str():string {
		if(this.product.data.has_no_price) {
			return '';
		}
		return this.util.getPriceWithCurrency(this.totalInclTax);
	}

	public get taxAmount():any { //getTaxAmount
		let p = this.discountedTotal;
		if(this.tax > 0){
			return '$ ' + (p * this.tax / 100).toFixed(2);
		} else {
			return 'Free';
		}
	}

	public get taxRate_str():string { //getTaxRateString
		if(this.tax > 0) {
			return '(+' + this.tax.toFixed(2) + '%)';
		}
		return '(No Tax)';
	}

	public get totalTaxAmount():number {
		let p = this.discountedTotal;
		if(this.tax > 0){
			return parseFloat((p * this.tax / 100).toFixed(2));
		} else {
			return 0;
		}
	}

	public get discountedTotal():number {    //getDiscountedTotal
		let p = this.price;
		if(this.discount.mode == 'percent') {
			p = p *  (1 - Math.abs(this.discount.value) / 100)
		} else {
			p = p - Math.abs(this.discount.value);
		}
		p = p * this.qty * this.sign;
		if(this.global_discount) {
			p = p * ( 1 - this.global_discount / 100);
		}
		return p;
	}

	public get discountedTotal_str():string {
		if(this.product.data.has_no_price) {
			return '';
		}
		return this.util.getPriceWithCurrency(this.discountedTotal);
	}

	public get discountedTotalWithoutGlobal():number {
		let p = this.price;
		if(this.discount.mode == 'percent') {
			p = p *  (1 - Math.abs(this.discount.value) / 100)
		} else {
			p = p - Math.abs(this.discount.value);
		}
		p = p * this.qty * this.sign;
		return p;
	}

	public get discountedTotalWithoutGlobal_str():string {
		if(this.product.data.has_no_price) {
			return '';
		}
		return this.util.getPriceWithCurrency(this.discountedTotalWithoutGlobal);
	}

	public get totalPrice() : number { //getTotal
		return this.price * this.qty * this.sign;
	}

	public get discountAmount(): number {
		let a = 0;
		if(this.discount.value) {
			if(this.discount.mode =='percent') {
				a = this.totalPrice * this.discount.value / 100;				
			} else {
				a = this.discount.value;
			}
		}
		return -a.toFixed(2);
	}
	
	public get discountAmount_str(): string{ //getDiscountAmount
		let a = 0;
		if(this.discount.value) {
			if(this.discount.mode =='percent') {
				a = this.totalPrice * this.discount.value / 100;				
			} else {
				a = this.discount.value;
			}
		}
		return this.util.getPriceWithCurrency(-a);
	}

	public get discountRate():string {
		let s = '';
		if(this.discount.value) {
			if(this.discount.mode =='percent') {
				s = (-this.discount.value).toFixed(2) + '%';
			} else {
				s = '$';
			}
		}
		return s;
	}

	public get inStock():boolean {		
		if(this.product) {
			return !this.product.data.tracking_inv || (this.inventory > this.qty);
		}
		return false;
	}

	public get listName():string {
		let result = this.product_name;
		if(this.variant_name) result += ' ' + this.variant_name;
		if(this.product) {
			if(this.product.data.tracking_inv) {
				result += '(' + (this.product.data.inventory - this.qty) + ')';
			}
		}
		return result;
	}

	public get inventory():number {
		if(this.variant_product) {
			return this.variant_product.inventory;
		} else if(this.product) {
			return this.product.data.inventory;
		}
		return 0;
	}

	public set inventory(n) {
		if(this.variant_product) {
			this.variant_product.inventory = n;
		} else if(this.product) {
			this.product.data.inventory = n;
		}
	}

	public get tracking_inv():boolean {
		if(this.product) {
			return this.product.data.tracking_inv;
		}
		return false;
	}

	public get inventory_virtual():number {		
		return this.inventory - this.qty;
	}

	getProduct():ICartProduct {
		const product:ICartProduct = {
			product_id: this.product_id,
			variant_id: this.variant_id,
			product_name: this.product_name,
			variant_name: this.variant_name,
			qty: this.qty,
			sign: this.sign,
			discount: {...this.discount},
			note: this.note,
			price: this.price,
			tax: this.tax,
			voided: this.voided,
			blank_cup_weight: this.blank_cup_weight,
			weight: this.weight,
			serial: this.serial
		}
		return product;
	}

	updateInventory(callback?:Function) {
		if(!this.product.data.tracking_inv){
			if(callback) callback(true);
			return;
		}
		const data = {
			product_id: this.product_id,
			variant_id: this.variant_id,
			qty: this.qty
		};
		if(!this.utilService) this.utilService = this.product.utilService;
		this.utilService.put('product/inventory', data).subscribe(result => {
			let inventory = result.body.inventory;
			if(inventory > 0) {
				this.product.data.inventory = inventory;
				if(callback) callback(true);
			} else {
				if(callback) callback(false);
			}
		}, error => {
			if(callback) callback(false);
		})
	}
}