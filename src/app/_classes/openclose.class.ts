import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import { Cart } from './cart.class';
import * as UtilFunc from '../_helpers/util.helper';

interface ICashMmovement{
    date: string,
    time: string,
    user: string,
    amount: string,
    reason: string
};

@Injectable({
    providedIn: 'root'
})
export class Openclose{
    _id: string = '';
    uid: string = '';
    user_id: any;
    private_web_address: string = '';
    register: any;
    outlet: any;
    opening_time: string = '';	
    closing_time: string = '';
    open_value: number = 0;
    open_note: string = '';
    close_note: string = '';
    counted: {
        cash: number,
        credit_card: number,
        master_card: number,
        debit_card: number
    };
    status: number = 1;

    util = UtilFunc;
    user:any;
    store_info: any;    
    cash_movements:ICashMmovement[] = [];
    all_payments:Cart[] = [];
    all_returns:Cart[] = [];
    all_voided:Cart[] = [];
    main_outlet: any;

    constructor(private authService: AuthService, private utilService: UtilService) {
        this.authService.currentUser.subscribe(user => {        
            this.user = user;                    
        });       
		this.utilService.get('auth/store', {}).subscribe(result => {    			
            this.store_info = result.body;      
        });  

        this.utilService.get('sell/outlet', {is_main: true}).subscribe(result => {
            if(result && result.body) {
              this.main_outlet = result.body[0];
            }
          })

        this.init();
    }

    init() {
        this._id = '';
        this.uid = '';
        this.user_id = null;
        this.private_web_address = '';
        this.register = null;
        this.outlet = null;
        this.opening_time = '';	
        this.closing_time = '';
        this.open_value = 0;
        this.open_note = '';
        this.close_note = '';
        this.counted = {
            cash: 0,
            credit_card: 0,
            master_card: 0,
            debit_card: 0
        };
        this.status = 1;
        this.cash_movements = [];
        this.all_payments = [];
        this.all_returns = [];
        this.all_voided = [];
    }

    loadCurrent(success?:Function, noexist?:Function) {
        const query = {
            private_web_address: this.user? this.user.private_web_address: null, 
            outlet: (this.user && this.user.outlet) ? this.user.outlet._id : this.main_outlet._id,
            register: this.user?this.user.outlet.register[0]:null,
            status: 1
        };
        if(!this.user || !this.user.outlet) delete query.outlet;
        this.init();
        this.utilService.get('sell/openclose', query).subscribe(result => {
            if(result && result.body && result.body.length>0) {                
                this.loadDetails(result.body[0]);                                
                success(this);
            } else {
                if(noexist) noexist();
            }
        }, error => {
            if(noexist) noexist();
        })
    }

    loadById(_id:string, success?:Function, noexist?:Function) {        
        this.init();
        this.utilService.get('sell/openclose?_id=' + _id).subscribe(result => {
            if(result && result.body) {                
                this.loadDetails(result.body);                                
                success(this);
            } else {
                if(noexist) noexist();
            }
        }, error => {
            if(noexist) noexist();
        })
    }

    public get openingFloat():ICashMmovement {
        let cm:ICashMmovement = {
            date: this.util.handleDate(this.opening_time),
            time: this.util.handleTime(this.opening_time),
            user: this.user_id.first_name + ' ' + this.user_id.last_name,
            amount: this.open_value.toFixed(2),
            reason: 'Opening float'
        }
        return cm;
    }

    loadDetails(details:any) {
        this._id = details._id;
        this.uid = details.uid;
        this.user_id = details.user_id;
        this.private_web_address = details.private_web_address;
        this.register = details.register;
        this.outlet = details.outlet;
        this.opening_time = details.opening_time;
        this.closing_time = details.closing_time;
        this.open_value = details.open_value;
        this.open_note =  details.open_note;
        this.close_note = details.close_note;
        this.counted = details.counted;
        this.status = details.status;
        if(details.payment_data) {                 
            this.loadAllPayments(details.payment_data.all_payments);
            this.loadAllCashMovements(details.payment_data.cash_movements);
            this.loadAllReturns(details.payment_data.all_returns);
            this.loadAllVoided(details.payment_data.all_voided);
        }
    }

    public get data():any {
        return {            
            open_value: this.open_value,
            open_note: this.open_note,
            close_note: this.close_note,
            counted: this.counted,
            status: this.status
        }
    }

    save(success?:Function, error?:Function) {                
		const data = this.data; 
		if(this._id) {
			data._id = this._id;    
		} else {
			delete data._id;
            data.user_id = this.user._id;
            data.private_web_address = this.user.private_web_address;
            data.outlet = this.user.outlet ? this.user.outlet._id : this.main_outlet._id;
            data.register = this.user.outlet.register[0]
		}
        if(data.status == 2) {
            data.closing_time = Date.now();
        }
        this.utilService.post('sell/openclose', data).subscribe(result => {	
			this.loadDetails(result.body)
            if(success) success(this);
        }, err => {
            if(error) error(this);
        })   
    }

    loadAllCashMovements(cash_movements:any) {
        this.cash_movements.push({
            date: this.util.handleDate(this.opening_time),
            time: this.util.handleTime(this.opening_time),
            user: this.user.first_name + ' ' + this.user.last_name,
            amount: this.open_value.toFixed(2),
            reason: 'Opening Float'
        })          
        for(let c of cash_movements) {
            let amount = c.transaction;
            if(c.is_credit == 0) amount *= -1;
            let cash:ICashMmovement = {
                date: this.util.handleDate(c.created_at),
                time: this.util.handleTime(c.created_at),
                user: c.user_id.first_name + ' ' + c.user_id.last_name,
                amount: amount.toFixed(2),
                reason: c.reasons
            }
            this.cash_movements.push(cash);
        }
    }

    loadAllPayments(all_payments) {                
        for(let s of all_payments) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(s);
            this.all_payments.push(cart);                    
        }                
    }

    loadAllReturns(all_returns) {        
        for(let s of all_returns) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(s);
            this.all_returns.push(cart);                    
        }                
    }

    loadAllVoided(all_voided) {        
        for(let s of all_voided) {
            let cart = new Cart(this.authService, this.utilService);
            cart.loadByCart(s);
            this.all_voided.push(cart);                    
        }                
    }

    public get receivedCash():string {
        let sum = this.all_payments.reduce((a, b)=>a + b.getReceivedPayments('cash'), 0);
        return sum.toFixed(2);
    }

    public get receivedCreditCard():string {
        let sum = this.all_payments.reduce((a, b)=>a + b.getReceivedPayments('credit'), 0);
        for(let p of this.all_payments) {            
            if(p.sale_status == 'on_account') {                
                sum += p.tax + parseFloat(p.totalExcl);
            }
        }
        return sum.toFixed(2);
    }

    public get receivedMasterCard():string {
        let sum = this.all_payments.reduce((a, b)=>a + b.getReceivedPayments('master'), 0);
        return sum.toFixed(2);
    }

    public get receivedDebitCard():string {
        let sum = this.all_payments.reduce((a, b)=>a + b.getReceivedPayments('debit'), 0);
        return sum.toFixed(2);
    }

    public get receivedStoreCredit():string {
        let sum = this.all_payments.reduce((a, b)=>a + b.getReceivedPayments('store_credit'), 0);
        return sum.toFixed(2);
    }

    public get totalCashMovements(): string {
        let sum = this.cash_movements.reduce((a, b)=>a + parseFloat(b.amount), 0);
        return sum.toFixed(2);
    }

    public get expectedCash(): string {
        let sum = parseFloat(this.totalCashMovements) + parseFloat(this.receivedCash);
        return sum.toFixed(2);
    }

    public get diffCash(): string {
        let diff = this.counted.cash - parseFloat(this.expectedCash);
        return diff.toFixed(2);
    }

    public get diffCreditCard():string {
        let diff = this.counted.credit_card - parseFloat(this.receivedCreditCard);
        return diff.toFixed(2);
    }

    public get diffMasterCard():string {
        let diff = this.counted.master_card - parseFloat(this.receivedMasterCard);
        return diff.toFixed(2);
    }

    public get diffDebitCard():string {
        let diff = this.counted.debit_card - parseFloat(this.receivedDebitCard);
        return diff.toFixed(2);
    }

    public get totalExpected():string {
        let sum = parseFloat(this.expectedCash) + parseFloat(this.receivedCreditCard) + parseFloat(this.receivedMasterCard) +  parseFloat(this.receivedDebitCard) 
                + parseFloat(this.receivedStoreCredit) + parseFloat(this.totalReturns) + parseFloat(this.totalVoided);
        return sum.toFixed(2)
    }

    public get totalCounted():string {
        let sum = this.counted.cash + this.counted.credit_card + this.counted.master_card  + this.counted.debit_card
         + parseFloat(this.receivedStoreCredit) + parseFloat(this.totalReturns);
        return sum.toFixed(2)
    }

    public get totalDiff():string {
        let sum = parseFloat(this.diffCash) + parseFloat(this.diffCreditCard) + 
                parseFloat(this.diffMasterCard) + parseFloat(this.diffDebitCard);
        return sum.toFixed(2)
    }

    public get totalReturns():string {
        let sum = this.all_returns.reduce((a, b)=> a + b.tax + parseFloat(b.totalExcl), 0);
        return sum.toFixed(2);
    }

    public get totalVoided():string {        
        let sum = -1 * this.all_voided.reduce((a, b)=> a + (b.voided?(b.tax + parseFloat(b.totalExcl)):b.voidedAmount), 0);
        return sum.toFixed(2);
    }

}