import { Injectable } from '@angular/core';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { Product } from './product.class';
import { Store } from './store.class';
import { AuthService } from '../_services/auth.service';

interface IProduct{
    product: Product,
    variant_id: string
}

@Injectable({
    providedIn: 'root'
})

export class Bundle{
    _id: string = '';
    bundle_id:number = 0;
    name: string = '';
    count: number = 0;
    price: number = 0;
    discount: number = 0;
    active: boolean = true;
    products:IProduct[] = [];

    store: Store;
    util = UtilFunc;

    constructor(private authService: AuthService, private utilService: UtilService)	{	
        this.store = new Store(this.authService, this.utilService);
        this.store.load();
		this.init();        
	}

    init() {
        this._id = '';
        this.bundle_id = 0;
        this.name = '';
        this.count = 0;
        this.price = 0;
        this.discount = 0;
        this.active = true;
        this.products = [];
    }

    loadById(_id:string, success?:Function, error?:Function) {
        this.utilService.get('product/bundle', {_id: _id}).subscribe(result => {
            if(result && result.body) {
                const bundle = result.body;
                this.loadDetails(bundle);
                if(success) success();
            } else {
                if(error) error();
            }
        }, err => {
            if(error) error();
        })
    }

    loadDetails(bundle:any) {
        this._id = bundle._id;
        this.bundle_id = bundle.bundle_id;
        this.name = bundle.name;
        this.count = bundle.count;
        this.price = bundle.price;
        this.discount = bundle.discount;
        this.active = bundle.active;        
        if(bundle.products && bundle.products.length > 0) {
            for(let p of bundle.products) {
                let product = new Product(this.authService, this.utilService);
                product.loadDetails(p.product_id);
                this.addProduct(product, p.variant_id);
            }
        }
    }

    public get discount_str():string {
        return this.util.getPriceWithCurrency(-this.discount);
    }

    public get data():any {
        let data = {
            _id: this._id,
            private_web_address: this.store.private_web_address,
            bundle_id: this.bundle_id,
            name: this.name,
            count: this.count,
            price: this.price,
            discount: this.discount,
            active: this.active,
            products: []
        };
        for(let p of this.products) {
            data.products.push({
                product_id: p.product._id,
                variant_id: p.variant_id
            });
        }
        return data;
    }

    addProduct(product:Product, variant_id: string) {
        let index = this.products.findIndex(item => item.product._id == product._id && item.variant_id == variant_id);
        if(index == -1) {
            let p:IProduct = {
                product: product,
                variant_id: variant_id
            };
            this.products.push(p);
        }
    }

    removeProduct(index:number) {        
        if(index > -1)this.products.splice(index, 1);
    }

    save(callback?:Function, error?:Function) {
        const data = this.data;
        if(data._id) {
            this.utilService.put('product/bundle', data).subscribe(result => {
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        } else {
            delete data._id;
            this.utilService.post('product/bundle', data).subscribe(result => {
                this._id = result._id;
                this.bundle_id = result.bundle_id;
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        }
    }

    delete(callback?:Function, err?:Function) {
		this.utilService.delete('product/bundle?_id=' + this._id).subscribe(response => {
			if(callback) callback();
		}, error => {
			if(err) err();
		});
	}

    getProductName(product:IProduct) {
        let result = product.product.data.name;
        if(product.variant_id) {
            let index = product.product.data.variant_products.findIndex(item => item._id == product.variant_id);
            if(index > -1) {
                result += ' <small>' + product.product.data.variant_products[index].name + '</small>';
            }
        }
        return result;
    }

    getProductPrice(product:IProduct) {
        let result = product.product.data.retail_price;
        if(product.variant_id) {
            let index = product.product.data.variant_products.findIndex(item => item._id == product.variant_id);
            if(index > -1) {
                result = product.product.data.variant_products[index].retail_price;
            }
        }
        return this.util.getPriceWithCurrency(result);
    }
}