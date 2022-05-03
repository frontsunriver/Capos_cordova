import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { Store } from './store.class';

export interface IPaymentButton {
    code: string,
    label: string
}

@Injectable({
    providedIn: 'root'
  })
export class Payment {
    static PAYMENT_TYPES = [
        'cash', 'credit', 'visa', 'master', 'amex', 'discover', 'diners', 'jcb',
        'debit', 'gift', 'rewards', 'others', 'others2', 'layby', 'store_credit', 'on_account', 
        'foodstamp', 'check', 'ebt_cash', 'charge_account'
    ];
    _id: string = '';
    others_name: string = '';
    payments: string[] = [];
    chk_payments:any = {};

    store: Store;
    util = UtilFunc;
    static UTIL = UtilFunc;    

    constructor(
		public authService: AuthService,
		public utilService: UtilService)	{	
        
        this.store = new Store(this.authService, this.utilService);
        this.store.load();
		
		this.init();
	}

    init() {        
        this._id = '';
        this.others_name = '';
        this.payments = [];
        for(let p of Payment.PAYMENT_TYPES) {
            this.chk_payments[p] = false;
        }
    }

    load(callback?:Function) {
        this.init();
        this.utilService.get('sale/paymenttype', {}).subscribe(result => {
            if(result && result.body) {
                const payment = result.body;
                this._id = payment._id;
                this.others_name = payment.others_name,
                this.payments = payment.payments;
                for(let p of Payment.PAYMENT_TYPES) {
                    if(this.payments.indexOf(p)>-1) {
                        this.chk_payments[p] = true;
                    }
                }
                if(callback) callback();
            }
        })
    }

    public get payment_buttons():IPaymentButton[] {
        let result:IPaymentButton[] = [];
        for(let p of Payment.PAYMENT_TYPES) {
            if(this.payments.indexOf(p)>-1) {
                let button: IPaymentButton = {
                    code: p,
                    label: Payment.getPaymentLabel(p)
                }
                if(p == 'others' && this.others_name) {
                    button.label = this.others_name;
                }
                result.push(button);
            }
        }
        return result;
    }

    public static getPaymentLabel(code:string):string {
        let label = Payment.UTIL.toUppercase(code);
        if(code == 'credit') label = 'Credit Card';
        if(code == 'ebt_cash') label = 'EBT Cash';
        if(code == 'store_credit') label = 'Store Credit';
        if(code == 'on_account') label = 'On Account';
        if(code == 'charge_account') label = 'Charge Account';        
        if(code == 'foodstamp') label = 'FoodStamp';        
        return label;
    }

    save(callback?:Function) {
        this.payments = [];
        for(let p of Payment.PAYMENT_TYPES) {
            if(this.chk_payments[p]) this.payments.push(p);
        }
        const data = {
            _id: this._id,
            private_web_address: this.store.private_web_address,
            payments: this.payments,
            others_name: this.others_name
        }
        if(this._id) {            
            this.utilService.put('sale/paymenttype', data).subscribe(result => {
                if(callback) callback();
            })
        } else {
            delete data._id;
            this.utilService.post('sale/paymenttype', data).subscribe(result => {
                this._id = result.body._id;
                if(callback) callback();
            })
        }
    }

    delete(callback?:Function) {
        this.utilService.delete('sale/paymenttype?_id=' + this._id).subscribe(result => {
            if(callback) callback();
        })
    }

}