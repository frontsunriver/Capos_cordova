import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { Product } from './product.class';
import { Store } from './store.class';

@Injectable({
    providedIn: 'root'
  })
export class Collection {
    _id: string = '';
    private_web_address: string = '';
    name: string = '';    
    image: string = '';
    active: boolean = true;
    parent: any = null;    
    products: Product[] = [];    
    children:any[] = [];

    // user:any;
    store: Store;

    constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	
        
        this.store = new Store(this.authService, this.utilService);
        this.store.load();		

		this.init();
	}

    init() {
        this._id = '';
        this.private_web_address = '';
        this.name = '';
        this.image = '';
        this.active = true;
        this.parent = null;
        this.products = [];
        this.children = [];
    }

    loadById(_id: string, success?:Function, no_exist?:Function) {
        this.init();
        this.utilService.get('product/collection', {_id: _id}).subscribe(result => {
            if(result && result.body) {
                const collection = result.body;
                this.loadDetails(collection);
                if(success) success();
            } else {
                if(no_exist) no_exist();
            }
        }, error => {
            if(no_exist) no_exist();
        })
    }

    loadDetails(details:any) {
        this._id = details._id;
        this.name = details.name;
        this.image = details.image;
        this.active = details.active;
        this.parent = details.parent;
        this.children = details.children;
        for(let p of details.products) {
            let product = new Product(this.authService, this.utilService);
            product.loadDetails(p);
            this.products.push(product);
        }
    }

    public get data() {
        let data = {
            _id: this._id,
            private_web_address: this.private_web_address || this.store.private_web_address,
            name: this.name,
            image: this.image,
            active: this.active,
            parent: this.parent? this.parent._id: null,
            products: []
        }
        for(let p of this.products) {
            data.products.push(p._id);
        }
        return data;
    }

    addProduct(product:Product) {
        let index = this.products.findIndex(item => item._id == product._id)
        if(index == -1) {
            this.products.push(product);
        }
    }

    save(callback?:Function, error?:Function) {
        const data = this.data;
        if(data._id) {
            this.utilService.put('product/collection', data).subscribe(result => {
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        } else {
            delete data._id;
            this.utilService.post('product/collection', data).subscribe(result => {
                this._id = result._id;
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        }
    }

    delete(callback?:Function, error?:Function) {
        this.utilService.delete('product/collection?_id=' + this._id).subscribe(result => {
            if(callback) callback();
        }, err => {
            if(error) error();
        })
    }
}