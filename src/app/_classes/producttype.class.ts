import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';

@Injectable({
    providedIn: 'root'
})
export class Producttype{	
	_id: string = '';
    data: {
        name: string,
        description: string,
		slug: string,
        private_web_address: string,
        products: number,
        touch: boolean,
        created_at:string
    }
    util = UtilFunc;
	user:any;
	store_info:any;

    constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	

		this.user = this.authService.getCurrentUser;
		this.utilService.get('auth/store', {}).subscribe(result => {    			
			this.store_info = result.body;      
		});

		this.utilService.get('auth/user?_id=' + this.user._id).subscribe(result => {
			this.user.outlet = result.body.outlet;        
		})

		this.init();
	}

    init() {
        this._id = '';
        this.data = {            
            private_web_address: '',
            name: '',
			slug: '',
            description: '',
            touch: false,
            products: 0,
            created_at:''
        };
    }

    loadById(_id:string, success?:Function, noexist?:Function) {		        
		this.utilService.get('product/type', {_id:_id}).subscribe(result => {
			if(result && result.body) {
				const details = result.body[0];
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
        delete data.created_at;
		return data;
	}

	save(callback?:Function, err?:Function) {
		const data = this.getDetails();
		if(this._id) {
			data._id = this._id;
			this.utilService.put('product/type', data).subscribe(result => {				
				if(result.body.status !== 'already_exist') {
					this.loadDetails(result.body);
				}
				if(callback) callback(result);
			}, error => {
				if(err) err(error);
			});
		} else {
			delete data._id;
			data.private_web_address = this.user.private_web_address;
			this.utilService.post('product/type', data).subscribe(result => {
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
		this.utilService.delete('product/type?_id=' + this._id).subscribe(response => {			
			callback();
		}, error => {
			if(err) err();
		});
	}
}