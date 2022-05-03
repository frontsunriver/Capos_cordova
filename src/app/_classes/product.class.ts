import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { APP_CONSTANTS } from '../_configs/constants';

export interface IVariantProduct{
    _id: string,
    name: string,
    sku: string,            
    supplier_code: string,
    supply_price: number,
    retail_price: number,
    enabled: boolean,
    inventory: number,
    reorder_point: number,
    reorder_amount: number,
    markup: number,
    image: string,
    pair: number[],
    pair_str: string
};

export interface IVariants{
    attribute: any,
    value: string[]
}

@Injectable({
    providedIn: 'root'
})
export class Product{	
	_id: string = '';
    data: {
        user_id: any,
        private_web_address: string,
        name: string,
        handle: string,
        brand: any,
        type: any,
        sku: string,
        description: string,
        supplier: any,
        supplier_code: string,
        barcode: string,
        supply_price: number,
        markup: number,
        retail_price: number,
        inventory: number,
        reorder_point: number,
        reorder_amount: number,
        outlet: any,
        tax: any,
        enabled: boolean,
        touch: boolean,
        tracking_inv: boolean,
        variant_inv: boolean,
        tag: string[],
        images: string[],    
        variant_products:IVariantProduct[],
        variants: IVariants[],
        feature:{featured:boolean, new_product: boolean, on_sale: boolean, hot_offer: boolean},
        created_at:string,

        price_prompt: boolean,
        food_stamp_item: boolean,
        serial_required: boolean,
        none_discount_item: boolean,
        minus_price: boolean,
        scale_product: boolean,
        blank_cup_weight: number,
        has_no_price: boolean,
        refill_pd: boolean,
        customer_info_req: boolean,
        used_on_display1: boolean,
        used_on_display2: boolean,
        price_not_changed_by_hq: boolean,
        cash_back: boolean,
        point_available: boolean,
        age_check_required: boolean,
        required_age: number,
        package_style: boolean,
        discount_type: boolean,
        deposit_return: boolean,        
    }
    util = UtilFunc;	
	store_info:any;

    constructor(
		public authService: AuthService,
		public utilService: UtilService) {	
		
		this.utilService.get('auth/store', {}).subscribe(result => {    			
			this.store_info = result.body;      
		});
        
		this.init();
	}

    init() {
        this._id = '';
        this.data = {
            user_id: null,
            private_web_address: '',
            name: '',
            handle: '',
            brand: null,
            type: null,
            sku: '',
            description: '',
            supplier: null,
            supplier_code: '',
            barcode: '',
            supply_price: 0,
            markup: 0,
            retail_price: 0,
            inventory: 0,
            reorder_point: 0,
            reorder_amount: 0,
            outlet: null,
            tax: null,
            enabled: true,
            touch: false,
            tracking_inv: false,
            variant_inv: false,
            tag: [],
            images: [],    
            variant_products:[],
            variants: [],
            feature:{featured: false, new_product: false, on_sale: false, hot_offer: false},
            price_prompt: false,
            food_stamp_item: false,
            serial_required: false,
            none_discount_item: false,
            minus_price: false,
            scale_product: false,
            blank_cup_weight: 0,
            has_no_price: false,
            refill_pd: false,
            customer_info_req: false,
            used_on_display1: false,
            used_on_display2: false,
            price_not_changed_by_hq: false,
            cash_back: false,
            point_available: false,
            age_check_required: false,
            required_age: 0,
            package_style: false,
            discount_type: false,
            deposit_return: false,
            created_at:''
        };
    }

    loadById(_id:string, success?:Function, noexist?:Function) {		
		this.utilService.get('product/product', {range:'_id', _id:_id}).subscribe(result => {
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
	}

    getDetails() {
		const data = {_id:'', ...this.data};
        let object_ids = ['user_id', 'brand', 'type', 'tax', 'supplier', 'outlet'];
		for(let key of object_ids) {
            if(this.data[key] && this.data[key]._id) {
                data[key] = this.data[key]._id;
            }
        }
        for(let vp of data.variant_products) delete vp._id;
        delete data.created_at;
		return data;
	}

	save(callback?:Function, err?:Function) {
		const data = this.getDetails();
		if(this._id) {
			data._id = this._id;
			this.utilService.put('product/product', data).subscribe(result => {				
				if(result.body.status !== 'already_exist') {
					this.loadDetails(result.body);
				}
				if(callback) callback(result);
			}, error => {
				if(err) err(error);
			});
		} else {
			delete data._id;
			data.private_web_address = this.store_info.private_web_address;
			this.utilService.post('product/product', data).subscribe(result => {
				if(result.body.status !== 'already_exist') {
					this._id = result._id;
					this.loadDetails(result.body);
				}
				if(callback) callback(result);
			}, error => {
				if(err) err(error);
			})
		}
	}

	delete(callback?:Function, err?:Function) {
		this.utilService.delete('product/product?_id=' + this._id).subscribe(response => {			
			callback();
		}, error => {
			if(err) err();
		});
	}

    public get totalInventory():string {
        if(!this.data.tracking_inv) {
            return '-';
        } else {
            if(!this.data.variant_inv) {
                return this.data.inventory.toString();
            } else {
                let sum = this.data.variant_products.reduce((a, b)=>a + b.inventory, 0);
                return sum.toString();
            }
        }
    }

    public get inStock():boolean {
        if(!this.data.tracking_inv) {
            return true;
        } else {
            if(!this.data.variant_inv) {
                return this.data.inventory>0;
            } else {
                let sum = this.data.variant_products.reduce((a, b)=>a + b.inventory, 0);
                return sum>0;
            }
        }
    }

    public getInVariantStock(pair):boolean {
        if(!this.data.tracking_inv) return true;
        if (this.data.variant_inv) {
            let vp = this.getVariantProductByPair(pair);
            if(vp) {
                return vp.inventory > 0;
            }
        }
        return false;
    }

    public getVariantProductByPair(pair) {
        for(let i=0;i<this.data.variant_products.length;i++) {
            let vp = this.data.variant_products[i], f = true;
            if(vp.pair.length == pair.length) {
                for(let j=0;j<pair.length;j++) {
                    if(vp.pair[j] != pair[j]) {
                        f = false;
                        break;
                    }
                }
            } else {
                f = false;
            }
            if(f) return vp;
        }
        return null;
    }

    public getInventory(variant_id:string=''):number {
        if(!this.data.variant_inv){
            return this.data.inventory;
        } else {
            let index = this.data.variant_products.findIndex(item => item._id == variant_id);
            if(index > -1) {
                return this.data.variant_products[index].inventory;
            } else {
                return 0;
            }
        }
    }

    public getPrice(variant_id:string=''):number {
        if(!this.data.variant_inv){
            return this.data.retail_price;
        } else {
            let index = this.data.variant_products.findIndex(item => item._id == variant_id);
            if(index > -1) {
                return this.data.variant_products[index].retail_price;
            } else {
                return 0;
            }
        }
    }

    public getPriceStr(variant_id:string=''):string {
        const price = this.getPrice(variant_id);
        return this.util.getPriceWithCurrency(price);
    }

    public get retail_price():string {
        return this.util.getPriceWithCurrency(this.data.retail_price);
    }

    public get image():string {
        if(this.data.images.length>0) {
            return APP_CONSTANTS.SERVER_URL + this.data.images[0];
        } else {
            return 'assets/product/product_default.png';
        }
    }

    public getImage(index: number) {
        if(index < this.data.images.length) {
            return APP_CONSTANTS.SERVER_URL + this.data.images[index];
        }
        return '';
    }
}