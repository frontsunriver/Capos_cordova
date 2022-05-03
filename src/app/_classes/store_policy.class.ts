import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';
import { Store } from './store.class';

interface ISetting {
    code: string,
    label: string
}

@Injectable({
    providedIn: 'root'
})

export class StorePolicy {
    _id: string = '';
    modules: string[] = [];
    prints:string[] = []
    batch_cashier_closing:string[] = [];
    others: {
        foreign_currency_used: boolean,
        foreign_currency: string,
        foreign_currency_rate: number,
        margin_rate: number,
        vendor_margin_rate_used: boolean,
        charge_limit: number,
        scale_weight_unit: string,
        settings: string[]
    };
    system: {
        settings: string[],
        smtp_server: string,
        sender_google_email: string,
        sender_pwd: string
    };
    employee_timesheet: {
        auto_start_day: boolean,
        pay_start_day: {
            mode: string,
            day: number
        },
        round_up: boolean,
        not_print: boolean
    };

    store: Store;
    util = UtilFunc;
    modules_settings:any = {};
    prints_settings:any = {};
    batch_settings:any = {};
    others_settings:any = {};
    system_settings: any = {};

    static MODULES:ISetting[] = [
        {code: 'box_barcode', label: 'Box Barcode Sale Used'},
        {code: 'buying_barcode', label: 'Buying Barcode Sale Used'},
        {code: 'same_code', label: 'Same Code used for different Products'},
        {code: 'pdcode_pdbarcode', label: 'PDCode and PDBarcode is the same for scale product'},
        {code: 'size_of_upc', label: 'The size of UPC E code is 8 rather than 6'},
        {code: '10_digit_barcode', label: '10 digit barcode used for UPC A'},
        {code: 'price_included', label: 'Price included barcode is $123.45 style'},
        {code: 'first_5_digit', label: 'First 5 digit used instead of 6 digit for price included barcode'},
        {code: 'sale_price_used', label: 'Sale Price Used'},
        {code: 'automatic_customer_id', label: 'Automatic customer ID used'},
        {code: 'customer_info', label: 'Customer information required'},
        {code: 'open_drawer', label: 'OpenDrawer on Credit payment'},
        {code: 'cash_drawer', label: 'Cash Drawer Open status checked'},
        {code: 'quick_open', label: 'Quick open cashdrawer needs password'},
        {code: 'debit_over', label: 'Debit over payment allowed (Cashback)'},
        {code: 'cashier_pwd_prompt', label: 'Cashier password prompted for sale screen access'},
        {code: 'cashier_pwd_always', label: 'Cashier password always prompted for each transaction'},
        {code: 'sales_helper', label: 'Sales helper always prompted'},
        {code: 'kg_instead', label: 'Kg instead of lb'},
        {code: 'weight_handled', label: 'Weight handled as quantity'},
        {code: '24_hour_service', label: '24 Hour Service'},
        {code: 'last_item', label: 'Last item first line displayed'},
        {code: 'alt_tab', label: 'Alt tab is not allowed'},
        {code: 'barcode_auto', label: 'Barcode generated automatically'},
        {code: 'ar_account', label: 'AR account is different form customers'},
        {code: 'tran_summary', label: 'Tran summary table used'},
        {code: 'pdcode_manual', label: 'PD code manual'},
        {code: 'product_info', label: 'Can not update product information'},
        {code: 'canada_penny', label: 'Canada Penny round used'},
        {code: 'event_marketing', label: 'Event marketing used'},
        {code: 'barcode_not_used', label: 'Price included barcode not used'}
    ];

    static PRINTS:ISetting[] = [
        {code: 'receipt_printed', label: 'Receipt Printed'},
        {code: 'store_copy', label: 'Store Copy Used'},
        {code: 'print_barcode', label: 'Print Barcode on Receipt'},
        {code: 'techtrex', label: 'Techtrex Receipt used'},
        {code: 'description', label: 'Description printed'},
        {code: 'store_logo', label: 'Store logo image used on receipt'},
        {code: 'dont_print_customer', label: 'Do not print customer information on receipt'},
        {code: 'small_size_printer', label: 'Small size printer font used'},
        {code: 'invoice_printing', label: 'Invoice printing prompted'},
        {code: 'dont_print_second', label: 'Do not print second product name on receipt'},
        {code: 'dont_display', label: 'Do not display / print sales information on receipt'},
        {code: 'print_product', label: 'Print product barcode number on receipt'},
        {code: 'email_receipt', label: 'Email receipt'},
        {code: 'print_bill', label: 'Print bill on Hold'},
        {code: 'print_cost', label: 'Print cost on inventory change report'},
        {code: 'price_not_print', label: 'Price is not printed on barcode label'},
        {code: 'name2_printed', label: 'Name2 printed on barcode label instead of description'},
        {code: 'vendor_code', label: 'Vendor and vendor code printed on shelf sticker'}
    ];

    static BATCH_CASHIER_CLOSINGS: ISetting[] = [
        {code: 'display_sale', label: 'Display sale summary in End of Day'},
        {code: 'batch_reopen', label: 'Batch reopen is not allowed'},
        {code: 'quick_batch', label: 'Quick batch on End of Day (Later Rebatch and Print required)'},
        {code: 'calendar', label: 'Calendar is not displayed on start of Day'},
        {code: 'auto_batch_close', label: 'Automatically batch close at 4:00 AM'},
        {code: 'email_inventory', label: 'Email inventory report on End of day'},
        {code: 'batch_report', label: 'Batch report is not printed'},
        {code: 'batch_all_category', label: 'Batch: All category printed'},
        {code: 'batch_category', label: 'Batch: Category not included'},
        {code: 'products_under', label: 'Products under basic stock count are listed on batch report'},
        {code: 'summary_for_payment', label: 'Summary for payment machine included in batch report'},
        {code: 'payment_summary', label: 'Payment summary is not included in Batch / Account summary report'},
        {code: 'cigarette_summary', label: 'Cigarette summary is not included in Batch / Account summary report'},
        {code: 'not_revenue', label: 'Not revenue category is not included in Account summary report'},
        {code: 'sales_person', label: 'Sales person report included in Batch report'},
        {code: 'kpos', label: 'KPOS support required'},
        {code: 'cashier_report', label: 'Cashier report is not printed'},
        {code: 'cashier_closing', label: 'Cashier closing final money managed'},
        {code: 'canceled_products', label: 'Canceled products are printed on cashier report'},
        {code: 'cannot_close_cashier', label: 'Can not close cashier with holding tran(s)'}
    ];

    static OTHERS:ISetting[] = [
        {code: 'no_tax_on_whole_sale', label: 'No tax on whole sale'},
        {code: 'pd_age', label: 'PD Age check used'},
        {code: 'keyboard', label: 'Keyboard I/F used'},
        {code: 'zero_item', label: 'Zero item sale not allowed'},
        {code: 'pd_button', label: 'PD button image used'},
        {code: 'same_line', label: 'Same line for the same product'},
        {code: 'pickup', label: 'Pickup DueDate required'},
        {code: 'product_image', label: 'Product image displayed on second monitor'},
        {code: 'no_tax_infor', label: 'No tax information on second monitor'},
        {code: 'display_in_red', label: 'Display in red when inventory is under basic stock count in sale scanning'},
        {code: 'display_other', label: 'Display other terminal’s HOLD Transactions'}
    ];

    static SYSTEMS:ISetting[] = [
        {code: 'ecommerce', label: 'Ecommerce Used'},
        {code: 'cancel_void', label: 'Cancel / void saved on DB'},
        {code: 'cashier_side', label: 'Cashier Side AD used'},
        {code: 'franchise', label: 'Franchise mode based on VPN'},
        {code: 'multiple', label: 'Multiple store support'},
        {code: 'hq', label: 'HQ'},
        {code: 'data_collection', label: 'Data collection used'},
        {code: 'data_collection_email', label: 'Data collection through email'},
        {code: 'each_store', label: 'Each store has different price'},
        {code: 'only_hq', label: 'Only HQ change product information'},
        {code: 'direct_sql', label: 'Direct SQL access used instead of FTP'},
        {code: 'customer_db', label: 'Customer DB located on HQ'},
        {code: 'daily_inventory', label: 'Daily inventory used'},
        {code: 'inventory_used', label: 'Inventory used'},
        {code: 'pi_based', label: 'PI based inventory'},
        {code: 'different_price', label: 'Different price applied on weekend'},
        {code: 'restaurant_style', label: 'Restaurant style biz model'},
        {code: 'fast_batch', label: 'Fast batch closing used'},
        {code: 'email_point', label: 'Email point / gift card information on end of day'},        
        {code: 'grocery_style', label: 'Grocery style sale screen used'},
        {code: 'send_email', label: 'Send Email on End of Day'},
        {code: 'paid_sms', label: 'Paid SMS used'},
        {code: 'email_sms', label: 'Email SMS used'},
        {code: 'smart_phone', label: 'Smart Phone SMS used'}
    ];

    constructor(private authService: AuthService, private utilService: UtilService) {
        this.store = new Store(this.authService, this.utilService);
        this.store.load();
		
        for(let s of StorePolicy.MODULES) {
            this.modules_settings[s.code] = false;
        }
        for(let s of StorePolicy.PRINTS) {
            this.prints_settings[s.code] = false;
        }
        for(let s of StorePolicy.BATCH_CASHIER_CLOSINGS) {
            this.batch_settings[s.code] = false;
        }
        for(let s of StorePolicy.OTHERS) {
            this.others_settings[s.code] = false;
        }
        for(let s of StorePolicy.SYSTEMS) {
            this.system_settings[s.code] = false;
        }

		this.init();
    }

    init() {
        this._id = '';
        this.modules = [];
        this.prints = [];
        this.batch_cashier_closing = [];
        this.others = {            
            foreign_currency_used: false,
            foreign_currency: '',
            foreign_currency_rate: 0,
            margin_rate: 0,
            vendor_margin_rate_used: false,
            charge_limit: 0,
            scale_weight_unit: '',
            settings: []
        };
        this.system = {
            settings: [],
            smtp_server: '',
            sender_google_email: '',
            sender_pwd: ''
        };
        this.employee_timesheet = {
            auto_start_day: false,            
            pay_start_day: {
                mode: '',
                day: 1
            },
            round_up: false,
            not_print: false
        };
    }

    load(callback?: Function) {
        this.init();
        this.utilService.get('sale/store_policy', {}).subscribe(result => {
            if(result && result.body) {
                let s = result.body;
                this._id = s._id;
                this.modules = s.modules;
                this.prints = s.prints;
                this.batch_cashier_closing = s.batch_cashier_closing;
                this.others = s.others;
                this.system = s.system;
                this.employee_timesheet = s.employee_timesheet;

                for(let s of StorePolicy.MODULES) {
                    if(this.modules.indexOf(s.code)>-1) {
                        this.modules_settings[s.code] = true;
                    }
                }
                for(let s of StorePolicy.PRINTS) {
                    if(this.prints.indexOf(s.code)>-1) {
                        this.prints_settings[s.code] = true;
                    }
                }
                for(let s of StorePolicy.BATCH_CASHIER_CLOSINGS) {
                    if(this.batch_cashier_closing.indexOf(s.code)>-1) {
                        this.batch_settings[s.code] = true;
                    }
                }
                for(let s of StorePolicy.OTHERS) {
                    if(this.others.settings.indexOf(s.code)>-1) {
                        this.others_settings[s.code] = true;
                    }
                }
                for(let s of StorePolicy.SYSTEMS) {
                    if(this.system.settings.indexOf(s.code)>-1) {
                        this.system_settings[s.code] = true;
                    }
                }
                if(callback) callback();
            }
        })
    }

    save(callback?:Function) {
        this.modules = [];
        for(let s of StorePolicy.MODULES) {
            if(this.modules_settings[s.code]) this.modules.push(s.code);
        }
        this.prints = [];
        for(let s of StorePolicy.PRINTS) {
            if(this.prints_settings[s.code]) this.prints.push(s.code);
        }
        this.batch_cashier_closing = [];
        for(let s of StorePolicy.BATCH_CASHIER_CLOSINGS) {
            if(this.batch_settings[s.code]) this.batch_cashier_closing.push(s.code);
        }
        this.others.settings = [];
        for(let s of StorePolicy.OTHERS) {
            if(this.others_settings[s.code]) this.others.settings.push(s.code);
        }
        this.system.settings = [];
        for(let s of StorePolicy.SYSTEMS) {
            if(s.code == 'data_collection_email' && !this.system_settings.data_collection) continue;
            if(this.system_settings[s.code]) this.system.settings.push(s.code);
        }
        const data = {
            _id: this._id,
            private_web_address: this.store.private_web_address,
            modules: this.modules,
            prints: this.prints,
            batch_cashier_closing: this.batch_cashier_closing,
            others: this.others,
            system: this.system,
            employee_timesheet:this.employee_timesheet
        }
        if(this._id) {            
            this.utilService.put('sale/store_policy', data).subscribe(result => {
                if(callback) callback();
            })
        } else {
            delete data._id;
            this.utilService.post('sale/store_policy', data).subscribe(result => {
                this._id = result.body._id;
                if(callback) callback();
            })
        }
    }

    delete(callback?:Function) {
        this.utilService.delete('sale/store_policy?_id=' + this._id).subscribe(result => {
            if(callback) callback();
        })
    }
}