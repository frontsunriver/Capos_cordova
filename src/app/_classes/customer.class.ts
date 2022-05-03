import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import { Constants } from '../_configs/constants';
import * as UtilFunc from '../_helpers/util.helper';
import { Group } from './group.class';

export interface User {  
  _id: string;
  private_web_address: string;  
  first_name: string;
  last_name: string;
  email: string;
  email_verify:boolean;
  phone: string;
  role: any;
  outlet: any;
}

export interface IAddress {
	street: string,
	city: string,
	suburb: string,
	postcode: string,
	state: string,
	country: string
}

@Injectable({
    providedIn: 'root'
})
export class Customer{	
	_id: string = '';
	data: {
		private_web_address: string,
		name: string,
		groupId: any,
		email: string,
		code: string,
		company: string ,
		birthday: string,
		gender: string ,
		website: string,
		twitter: string,
		mobile: string,
		phone: string,
		fax: string,
		physical_address: IAddress;
		postal_address: IAddress;
		exist_postal_address: boolean,
		note: string,
		custom_information: {field1: string, field2: string},
		total_spent: number,
		debit: number ,
		credit: number,
		total_issued: number,
		total_redeemed: number,
		point: number,
		point_issued: number,
		point_redeemed: number
	};
	temp:{
		debit: number, 
		credit:number, 
		total_spent:number, 
		total_issued:number, 
		total_redeemed:number,
		point: number,
		point_issued: number,
		point_redeemed: number
	};

	util = UtilFunc;
	user:any;	
	store_info:any;
	type:string = 'customer';
	groups: Group[] = [];

	constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	

		this.user = this.authService.getCurrentUser;
		this.utilService.get('auth/store', {}).subscribe(result => {    			
			this.store_info = result.body;      
		});

		if(this.user) {
			this.utilService.get('auth/user?_id=' + this.user._id).subscribe(result => {
				this.user.outlet = result.body.outlet;        
			})
		}
		
		this.utilService.get('customers/group', {}).subscribe(result => {
			if(result && result.body) {
				for(let g of result.body) {
					let group = new Group(this.authService, this.utilService);
					group.loadDetails(g);
					this.groups.push(group);
				}
			}
		})

		this.init();
	}

	init() {
		this.data = {
			private_web_address: '',
			name: '',
			groupId: null,
			email: '',
			code: '',
			company: '',
			birthday: '',
			gender: 'Male',
			website: '',
			twitter: '',
			mobile: '',
			phone: '',
			fax: '',
			physical_address: {
				street: '',
				city: '',
				state: '',
				suburb: '',
				country: null,
				postcode: ''
			},
			postal_address: {
				street: '',
				city: '',
				state: '',
				suburb: '',
				country: null,
				postcode: ''
			},
			exist_postal_address: false,
			note: '',
			custom_information: {field1: '', field2: ''},
			total_spent: 0,
			debit: 0,
			credit: 0,
			total_issued: 0,
			total_redeemed: 0,
			point: 0,
			point_issued: 0,
			point_redeemed: 0
		}
		this.temp = {
			debit:0, 
			credit:0, 
			total_issued:0, 
			total_redeemed:0, 
			total_spent:0,
			point: 0,
			point_issued: 0,
			point_redeemed: 0
		};
	}

	loadById(_id:string, success?:Function, noexist?:Function) {		
		this.utilService.get('customers/' + this.type, {range:'_id', _id:_id}).subscribe(result => {
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
		this._id = details._id;
		let keysToRemvoe = [ '__v', 'is_deleted', 'created_at', 'balance'];		
		for(let key of keysToRemvoe) delete details[key];
		this.data = Object.assign(this.data, details);
		this.temp = {
			debit:0, 
			credit:0, 
			total_issued:0, 
			total_redeemed:0, 
			total_spent:0,
			point: 0,
			point_issued: 0,
			point_redeemed: 0
		};
	}

	public get username():string {
		let name = this.data.name;
		if(this.data.email) name += ' (' + this.data.email + ')';
		return name;
	}

	public get balance():number {return (this.data.credit + this.temp.credit) - (this.data.debit + this.temp.debit);}
	public get balance_str():string {		
		return this.util.getPriceWithCurrency(this.balance);
	}

	public get debit_str():string {
		return this.util.getPriceWithCurrency(this.data.debit + this.temp.debit);
	}

	public get credit_str():string {
		return this.util.getPriceWithCurrency(this.data.credit + this.temp.credit);
	}

	public get total_spent_str():string {
		return this.util.getPriceWithCurrency(this.data.total_spent + this.temp.total_spent);
	}

	public get total_issued_str():string {
		return this.util.getPriceWithCurrency(this.data.total_issued + this.temp.total_issued);
	}

	public get total_redeemed_str():string {
		return this.util.getPriceWithCurrency(this.data.total_redeemed + this.temp.total_redeemed);
	}

	public get point_str():string {
		return this.util.getPriceWithCurrency(this.data.point + this.temp.point);
	}

	public get point_issued_str():string {
		return this.util.getPriceWithCurrency(this.data.point_issued + this.temp.point_issued);
	}

	public get point_redeemed_str():string {
		return this.util.getPriceWithCurrency(this.data.point_redeemed + this.temp.point_redeemed);
	}

	public get contactInfo():string {
    let result = '';
		if(this.data.mobile) {
			result = this.data.mobile;
		} else if(this.data.phone) {
			result = this.data.phone;
		} else if(this.data.fax) {
			result = this.data.fax;
		}
    return result;
  }

	getDetails() {
		const data = {_id:'', ...this.data};
		Object.keys(this.temp).forEach(key => {
			data[key] += this.temp[key];
		})				
		data.groupId = this.checkGroup(data.total_spent);
		return data;
	}

	save(callback?:Function, err?:Function) {
		const data = this.getDetails();		
		if(this._id) {
			data._id = this._id;
			this.utilService.put('customers/' + this.type, data).subscribe(result => {				
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
			this.utilService.post('customers/' + this.type, data).subscribe(result => {
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
		this.utilService.delete('customers/' + this.type + '?_id=' + this._id).subscribe(response => {			
			callback();
		}, error => {
			if(err) err();
		});
	}

	checkGroup(total_spent:number):string {
		if(this.groups.length>0) {
			let groupId = this.groups[this.groups.length-1]._id;			
			for(let g of this.groups) {
				if(this.data.total_spent<=g.limit) {
					groupId = g._id;
					break;
				}
			}
			return groupId;
		}
		return null;
	}

}
  