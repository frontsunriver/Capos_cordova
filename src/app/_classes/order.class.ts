import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { Product } from './product.class';

export interface IOrderProduct{
    product_id: string,
    variant_id: string,
    product_name: string,
    variant_name: string,
    qty: number,
    supply_price: number,
    product: Product
};

@Injectable({
    providedIn: 'root'
})
export class Order{	
	_id: string = '';
    data: {
        user_id: any,
        private_web_address: string,
        order_number: string,
        deliver_to: any,
        supplier: any,
        invoice_number: string,
        delivery_date: string,
        note: string,
        status: string,
        products: IOrderProduct[],
        created_at: string,
        type: string
    };

    util = UtilFunc;
	user:any;

    constructor(
		public authService: AuthService,
		public utilService: UtilService)	{	

		this.user = this.authService.getCurrentUser;
		this.utilService.get('auth/user?_id=' + this.user._id).subscribe(result => {
			this.user.outlet = result.body.outlet;        
		})

		this.init();
	}

    init() {
        this._id = '';
        this.data = {
            user_id: null,
            private_web_address: '',
            order_number: this.util.genRandomOrderString(8),
            deliver_to: null,
            supplier: null,
            invoice_number: '',
            delivery_date: '',
            note: '',
            status: 'open',
            products: [],
            created_at: '',
            type: 'purchase'
        }
    }

    loadById(_id:string, success?:Function, noexist?:Function) {		
		this.utilService.get('product/order', {range:'_id', _id:_id}).subscribe(result => {
			if(result && result.body) {
				const details = result.body;
				this.loadDetails(details);
				if(success) success(this);
			} else {				
				if(noexist) {
					noexist();
				}
			}
		}, error => {
			if(noexist) {
				noexist();
			}
		});
	}

	loadDetails(details:any) {
        if(details._id) {
            this._id = details._id;
        } 

		let keysToRemvoe = [ '__v', 'is_deleted'];		
		for(let key of keysToRemvoe) delete details[key];
		this.data = Object.assign(this.data, details);		
        this.data.products = [];
        for(let p of details.products) {
            let product = new Product(this.authService, this.utilService);
            product.loadDetails(p.product_id);
            let order_product:IOrderProduct = {                
                product_id: product._id,
                product_name: p.product_name,
                variant_id: p.variant_id,
                variant_name: p.variant_name,
                qty: p.qty,
                supply_price: p.supply_price,
                product: product
            }
            this.data.products.push(order_product);
        }
	}

    getDetails() {
        let data:any;
        data = Object.assign({}, this.data);		
        data.products = [];
        let object_ids = ['user_id', 'deliver_to', 'supplier'];
		for(let key of object_ids) {
            if(this.data[key] && this.data[key]._id) {
                data[key] = this.data[key]._id;
            }
        }
        for(let vp of this.data.products) {            
            let product = {};
            Object.keys(vp).forEach(key => {
                if(key != 'product') {
                    product[key] = vp[key];
                }
            })
            data.products.push(product);
        }
        delete data.created_at;        
		return data;
	}

    getProductTotal(product:IOrderProduct):number {        
        return parseFloat((product.qty * product.supply_price).toFixed(2));
    }

    getProductTotal_str(product:IOrderProduct):string {
        let total = this.getProductTotal(product);
        return this.util.getPriceWithCurrency(total);
    }

    public static getProductInventory(product:IOrderProduct):number {
        if(product.variant_id) {
            let variant = Order.getVariant(product);            
            if(variant) {
                return variant.inventory;
            } else {
                return 0;
            }
        } else {
            return product.product.data.inventory;
        }
    }

    public static getVariant(product:IOrderProduct) {
        let index = product.product.data.variant_products.findIndex(item => item._id == product.variant_id);
        if(index > -1) {
            return product.product.data.variant_products[index];
        }
        return null;
    }

    getProductRetailPrice(product:IOrderProduct):string {
        let result = 0;
        if(product.variant_id) {
            let variant = Order.getVariant(product);
            if(variant) {
                result = variant.retail_price;
            }
        } else {
            result = product.product.data.retail_price;
        }
        return this.util.getPriceWithCurrency(result);
    }

    getProductRetailTotal(product:IOrderProduct):string {
        let qty = product.qty;
        let result = 0;
        if(product.variant_id) {
            let variant = Order.getVariant(product);
            if(variant) {
                result = variant.retail_price * qty;
            }
        } else {
            result = product.product.data.retail_price * qty;
        }
        return this.util.getPriceWithCurrency(result);
    }

    addProduct(product:IOrderProduct) {
        let index = this.data.products.findIndex(item => item.product_id == product.product_id && item.variant_id == product.variant_id);        
        if(index == -1) {
            this.data.products.push(product);
        } else {
            this.data.products[index].qty += product.qty;
        }
    }

    removeProduct(index: number) {
        this.data.products.splice(index, 1);
    }

    public static getNewOrderProduct(product:Product, variant_id?:string) {
        let order_product:IOrderProduct = {
            product_id: product._id,
            product_name: product.data.name,
            variant_name: '',
            variant_id: '',
            qty: 1,
            supply_price: product.data.supply_price,
            product: product
        };
        if(variant_id) {
            let index = product.data.variant_products.findIndex(item => item._id == variant_id);
            if(index > -1) {
                order_product.variant_id = variant_id;
                order_product.variant_name = product.data.variant_products[index].name;
            }
        }        
        return order_product;
    }

	save(callback?:Function, err?:Function) {
		const data = this.getDetails();
		if(this._id) {
			this.utilService.put('product/order', {field: 'all', _id: this._id, ...data}).subscribe(result => {				
                this.updateInventory();
				if(callback) callback(result);
			}, error => {
				if(err) err(error);
			});
		} else {
			data.private_web_address = this.user.private_web_address;
            data.user_id = this.user._id;
			this.utilService.post('product/order', data).subscribe(result => {
                this.updateInventory();
                this._id = result._id;				
				if(callback) callback(result);
			}, error => {
				if(err) err(error);
			})
		}
	}

    updateInventory() {
        if(this.data.status == 'open') return;
        let products:Product[] = [];
        for(let p of this.data.products) {
            let product = p.product; 
            let f = false;
            if(p.variant_id) {
                let variant = Order.getVariant(p);
                if(variant){
                    if(this.data.status == 'received'){
                        variant.inventory += p.qty;
                    }
                    if(this.data.status == 'returned'){
                        variant.inventory -= p.qty;
                    }
                    f = true;
                }
            } else {
                if(this.data.status == 'received'){
                    product.data.inventory += p.qty;
                }
                if(this.data.status == 'returned'){
                    product.data.inventory -= p.qty;
                }
                f = true;
            }
            if(f){
                let index = products.findIndex(item => item._id == product._id);
                if(index==-1) products.push(product);
            }
        }
        for(let product of products) {
            product.save();
        }
    }

	delete(callback?:Function, err?:Function) {
		this.utilService.delete('product/order?_id=' + this._id).subscribe(response => {			
			callback();
		}, error => {
			if(err) err();
		});
	}

    public get total():number {
        let sum = this.data.products.reduce((a, b) => a + this.getProductTotal(b), 0);
        if(this.data.type == 'return') sum *= -1;
        return sum;
    }

    public get total_str():string {
        return this.util.getPriceWithCurrency(this.total);
    }

    public get items():number {
        let sum = this.data.products.reduce((a, b)=>a + b.qty, 0);
        if(this.data.type == 'return') sum *= -1;
        return sum;
    }

    public get status():string {
        return this.util.toUppercase(this.data.status);
    }
}
