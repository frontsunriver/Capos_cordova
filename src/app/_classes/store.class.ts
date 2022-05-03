import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { UtilService } from '../_services/util.service';
import * as UtilFunc from '../_helpers/util.helper';

interface IAddress{
    street: string,
    city: string,
    suburb: string,
    postcode: string,
    state: string,
    country: any
}

export interface IBanner{
    image: string,
    title: string,
    subtitle: string,
    button: string,
    href: string
}

export interface IService{
    name: string,
    description: string,
    icon: string
}

interface ICustomerPointGift{
    code: string,
    label: string
}

@Injectable({
    providedIn: 'root'
})
export class Store {
    _id: string = '';
    private_web_address: string = '';
    store_name: string = '';
    domain_name: string = '';
    first_name: string = '';
    last_name: string = '';
    email: string = '';
    phone: string = '';
    profile_image: string = '';
    logo: string = '';
    social_link: {
        facebook: string,
        twitter: string,
        linkedin: string,
        youtube: string,
    }
    website: string = '';
    physical_address: IAddress;
    postal_address: IAddress;
    sequence_number: number = 0;
    default_currency: any = null;
    default_tax: string = '';
    template: string = '';
    user_switch_security: number = 1;
    active:boolean = false;
    click_collect: boolean = false;
    plan: {
        id:string,
        subscriptionId:string
    };
    renewal_date:string = '';
    store_pickup: boolean = true;
    paypal:{
        active: boolean,
        secret: string,
        client_id: string
    }
    stripe:{
        active: boolean,
        secret_key: string,
        public_key: string
    }
    preferences: {
        messagebox: boolean,
        confirm_delete_product: boolean,
        confirm_discard_sale: boolean,
        confirm_pay: boolean
    }
    active_widget: {
        services: boolean,
        sliders: boolean,
        banners: boolean,
        about_us: boolean,
        faq: boolean,
        blog: boolean
    }
    sliders: IBanner[] = [];
    banners: IBanner[] = [];
    services: IService[] = [];
    short_description:string = '';
    theme_color: string = '';
    customer_point_gift:string[] = [];
    gift_rate: number = 0;
    dealer_rate: number = 0;

    static CUSTOMER_POINT_GIFT:ICustomerPointGift[] = [
        {code: 'point_used', label: 'Point Used'},
        {code: 'complex_point_used', label: 'Complex Point Used'},
        {code: 'special_items_excluded_on_point', label: 'Special Items excluded on point'},
        {code: 'on_issuing_new_card_customer_information_gathering_form_printed', label: 'On issuing new card, customer information gathering form printed'},
        {code: 'point_amount_displayed_as_number_instead_of_money_amount', label: 'Point amount displayed as number instead of money amount'},
        {code: 'point_amount_applied_to_subtotal', label: 'Point amount applied to subtotal'},
        {code: 'point_information_is_not_printed_on_receipt', label: 'Point Information is not printed on receipt'},
        {code: 'only_total_point_printed_on_receipt', label: 'Only total point printed on receipt (No point history)'},
        {code: 'gift_card_usage_history_is_not_printed_on_receipt', label: 'Gift card usage history is not printed on receipt'},
        {code: 'point_amount_displayed_on_Sale_window', label: 'Point amount displayed on Sale window'},
        {code: 'gift_bonus_added', label: 'Gift Bonus added'},
        {code: 'auto_custid_used', label: 'Auto custID used'},
        {code: 'dr_used', label: 'DR used'},
        {code: 'customer_card_9_digits', label: 'Customer Card: 9 digits'},
        {code: 'phone_number_can_not_used_as_card_number', label: 'Phone number can not used as card number'},
        {code: 'dealer_point_used', label: 'Dealer Point Used'}
    ]
    customer_point_gift_settings:any= {};
    user:any;
    util = UtilFunc;

    constructor(
		private authService: AuthService,
		private utilService: UtilService)	{	
        
		this.user = this.authService.getCurrentUser;		

        for(let s of Store.CUSTOMER_POINT_GIFT) {
            this.customer_point_gift_settings[s.code] = false;
        }

		this.init();
	}

    init() {
        this._id = '';
        this.private_web_address = '';
        this.store_name = '';
        this.domain_name = '';
        this.first_name = '';
        this.last_name = '';
        this.email = '';
        this.phone = '';
        this.profile_image = '';
        this.logo = '';
        this.social_link = {            
            facebook: '',
            twitter: '',
            linkedin: '',
            youtube: ''
        };
        this.website = '';
        this.physical_address = {
            street: '',
            city: '',
            suburb: '',
            postcode: '',
            state: '',
            country: null
        };
        this.postal_address = {
            street: '',
            city: '',
            suburb: '',
            postcode: '',
            state: '',
            country: null
        };
        this.sequence_number = 0;
        this.default_currency = null;
        this.default_tax = 'outlet';
        this.template = '';
        this.user_switch_security = 1;        
        this.active = false;
        this.click_collect = false;
        this.store_pickup = true;
        this.paypal = {
            active: false,
            secret: '',
            client_id: ''
        };
        this.stripe = {
            active: false,
            secret_key: '',
            public_key: ''
        }    
        this.plan = {
            id: 'free',
            subscriptionId: ''
        };
        this.preferences = {
            messagebox : true,
            confirm_delete_product: true,
            confirm_discard_sale: true,
            confirm_pay: true
        },
        this.sliders = [];
        this.banners = [];
        this.services = [];
        this.short_description = '';
        this.theme_color = '';
        this.active_widget = {
            sliders: true,
            banners: true,
            services: true,
            about_us: true,
            faq: true,
            blog: true
        };
        this.customer_point_gift = [];
        this.gift_rate = 0;
        this.dealer_rate = 0;
    }

    load(success?:Function, no_exist?:Function) {
        this.init();
        this.utilService.get('auth/store', {}).subscribe(result => {    			
            if(result && result.body) {
                const store = result.body;
                this._id = store._id;
                this.private_web_address = store.private_web_address;
                this.domain_name = store.domain_name || '';
                this.store_name = store.store_name || '';
                this.first_name = store.first_name || '';
                this.last_name = store.last_name || '';
                this.email = store.email || '';
                this.phone = store.phone || '';
                this.profile_image = store.profile_image || '';
                this.logo = store.logo || '';
                this.social_link = store.social_link;
                this.website = store.website || '';
                this.physical_address = store.physical_address;
                this.postal_address = store.postal_address;
                this.sequence_number = store.sequence_number || 0;
                this.default_currency = store.default_currency;
                this.default_tax = store.default_tax || 'outlet';
                this.template = store.template || '';
                this.user_switch_security = store.user_switch_security || 1;
                this.preferences = store.preferences;
                this.active = store.active;
                this.click_collect = store.click_collect || false;
                this.store_pickup = store.store_pickup;
                this.paypal = store.paypal || {active: false, secret: '', client_id: ''}; 
                this.stripe = store.stripe || {active: false, secret_key: '', public_key: ''}; 
                this.sliders = store.sliders || [];
                this.banners = store.banners || [];
                this.services = store.services || [];
                this.short_description = store.short_description || '';
                this.theme_color = store.theme_color || '';
                this.active_widget = store.active_widget;
                if(store.plan) this.plan = store.plan;
                this.customer_point_gift = store.customer_point_gift;
                this.gift_rate = store.gift_rate;
                this.dealer_rate = store.dealer_rate;
                for(let s of Store.CUSTOMER_POINT_GIFT) {
                    let index = this.customer_point_gift.findIndex(item => item == s.code);
                    if(index > -1) {
                        this.customer_point_gift_settings[s.code] = true;
                    }
                }
                if(success) success();
            } else {
                if(no_exist) no_exist();
            }
        }, error => {
            if(no_exist) no_exist();
        });
    }

    loadData(data:any) {
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });        
    }

    public get data():any {
        let customer_point_gift:string[] = [];
        for(let s of Store.CUSTOMER_POINT_GIFT) {
            if(this.customer_point_gift_settings[s.code]) {
                if(s.code == 'complex_point_used' && !this.customer_point_gift_settings.point_used) continue;
                customer_point_gift.push(s.code);
            }
        }
        this.customer_point_gift = customer_point_gift;
        let data = {
            _id: this._id,
            private_web_address: this.private_web_address,
            store_name: this.store_name,
            domain_name: this.domain_name,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone,
            profile_image: this.profile_image,
            logo: this.logo,
            social_link: this.social_link,
            website: this.website,
            physical_address: {
                street: this.physical_address.street,
                city: this.physical_address.city,
                suburb: this.physical_address.suburb,
                postcode: this.physical_address.postcode,
                state: this.physical_address.state,
                country: this.physical_address.country ? this.physical_address.country._id: null
            },
            postal_address: {
                street: this.postal_address.street,
                city: this.postal_address.city,
                suburb: this.postal_address.suburb,
                postcode: this.postal_address.postcode,
                state: this.postal_address.state,
                country: this.postal_address.country ? this.postal_address.country._id: null
            },
            sequence_number : this.sequence_number,
            default_currency: this.default_currency ? this.default_currency._id: null,
            default_tax: this.default_tax,
            template: this.template,
            user_switch_security: this.user_switch_security,
            preferences: this.preferences,
            active: this.active,
            click_collect: this.click_collect,
            store_pickup: this.store_pickup,
            paypal: {...this.paypal},
            stripe: {...this.stripe},
            plan: this.plan,
            banners: this.banners,
            sliders: this.sliders,
            services: this.services,
            short_description: this.short_description,
            theme_color: this.theme_color,
            active_widget: this.active_widget,
            customer_point_gift: this.customer_point_gift,
            gift_rate: this.gift_rate,
            dealer_rate: this.dealer_rate
        };        
        return data;
    }

    save(callback?:Function, error?:Function) {
        const data = this.data;
        if(data._id) {
            this.utilService.put('auth/store', data).subscribe(result => {
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        } else {
            delete data._id;
            this.utilService.post('auth/store', data).subscribe(result => {
                this._id = result._id;
                if(callback) callback(result);
            }, err => {
                if(error) error();
            })
        }
    }
}
