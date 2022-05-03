import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { IPaymentButton, Payment } from './payment.class';
import { Store } from './store.class';

export interface IPointRate{
    payment:string,
    rate:number
}

@Injectable({
    providedIn: 'root'
})
export class Group {
    _id: string = '';
    name: string = '';    
    limit: number = 0;
    point_rates:IPointRate[] = [];

    point_rate_values:any = {};
    store: Store;
    util = UtilFunc;
    point_rates_labels:IPaymentButton[] = [];

    constructor(private authService: AuthService, private utilService: UtilService) {
        this.store = new Store(this.authService, this.utilService);
        this.store.load();
        for(let p of Payment.PAYMENT_TYPES) {
            if(!['layby', 'on_account', 'store_credit'].includes(p)) {
                this.point_rate_values[p] = 0;
            }
        }
        this.getPointRatesLabels();
        this.init();
    }

    init() {
        this._id = '';
        this.name = '';
        this.limit = 0;
        this.point_rates = [];
    }

    loadDetails(group:any) {
        this._id = group._id;
        this.name = group.name;
        this.limit = group.limit;
        this.point_rates = group.point_rates;
        for(let p of this.point_rates) {
            this.point_rate_values[p.payment] = p.rate;
        }
    }

    addPointRate(payment:string, rate:number) {
        if(payment && rate) {
            let index = this.point_rates.findIndex(item => item.payment == payment);
            if(index>-1) {
                this.point_rates.push({
                    payment: payment,
                    rate: rate
                });
            } else {
                this.point_rates[index].rate = rate;
            }
        }
    }

    public getPointRatesLabels(){
        let result:IPaymentButton[] = [];
        for(let p of Payment.PAYMENT_TYPES) {
            if(!['layby', 'on_account', 'store_credit'].includes(p)) {
                result.push({
                    code: p,
                    label: Payment.getPaymentLabel(p)
                })
            }
        }
        this.point_rates_labels = result;
    }

    public get point_rates_str():string {
        let result = '';
        for(let p of this.point_rates) {
            if(result!='') result += ', ';
            result += Payment.getPaymentLabel(p.payment) + ': ' + p.rate.toFixed(1) + '%';
        }        
        return result;
    }

    save(callback?:Function) {        
        let point_rates:IPointRate[] = [];
        for(let p of Payment.PAYMENT_TYPES) {
            let rate = parseFloat(this.point_rate_values[p]);
            if(rate > 0) {
                let p_rate:IPointRate = {
                    payment: p,
                    rate: rate
                }                
                point_rates.push(p_rate);
            }
        }        
        this.point_rates = point_rates;
        const data = {
            _id: this._id,
            private_web_address: this.store.private_web_address,
            name: this.name,
            limit: this.limit,
            point_rates: this.point_rates
        }
        if(this._id) {            
            this.utilService.put('customers/group', data).subscribe(result => {
                if(callback) callback(result);
            })
        } else {
            delete data._id;
            this.utilService.post('customers/group', data).subscribe(result => {
                if(result.body._id) this._id = result.body._id;
                if(callback) callback(result);
            })
        }
    }

    delete(callback?:Function) {
        this.utilService.delete('customers/group?_id=' + this._id).subscribe(result => {
            if(callback) callback();
        })
    }
}