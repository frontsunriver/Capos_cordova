import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AttributeModel } from '../_models/attribute-model';
import { CountryModel } from '../_models/country-model';
import { CurrencyModel } from '../_models/currency-model';
import * as UtilFunc from '../_helpers/util.helper';
import { Song } from '../_models/song';
import { BrandModel } from '../_models/brand-model';
import { BundleModel } from '../_models/bundle-model';
import { BundleProductModel } from '../_models/bundle-product-model';
import { CartModel } from '../_models/cart-model';
import { CollectionProductModel } from '../_models/collection-product-model';
import { CustomerPayBalanceLogsModel } from '../_models/customer-pay-balance-logs-model';
import { GroupPointRateModel } from '../_models/group-point-rate-model';
import { OnlineorderProductModel } from '../_models/onlineorder-product-model';
import { OnlineorderPaymentModel } from '../_models/onlineorder-payment-model';
import { OnlineorderPaymentStatusHistoryModel } from '../_models/onlineorder-payment-status-history-model';
import { OnlineorderStatusHistoryModel } from '../_models/onlineorder-status-history-model';
import { OrderProductModel } from '../_models/order-product-model';
import { ProductVariantProductModel } from '../_models/product-variant-product-model';
import { ProductVariantModel } from '../_models/product-variant-model';
import { SaleProductModel } from '../_models/sale-product-model';
import { SalePaymentModel } from '../_models/sale-payment-model';
import { SaleVoidedPaymentModel } from '../_models/sale-voided-payment-model';
import { CashModel } from '../_models/cash-model';
import { CollectionModel } from '../_models/collection-model';
import { CustomerModel } from '../_models/customer-model';
import { GroupModel } from '../_models/group-model';
import { OnlineorderModel } from '../_models/onlineorder-model';
import { OpencloseModel } from '../_models/openclose-model';
import { OrderModel } from '../_models/order-model';
import { OutletModel } from '../_models/outlet-model';
import { PaymenttypeModel } from '../_models/paymenttype-model';
import { PermissionModel } from '../_models/permission-model';
import { PricebookModel } from '../_models/pricebook-model';
import { ProductModel } from '../_models/product-model';
import { ProducttypeModel } from '../_models/producttype-model';
import { RegisterModel } from '../_models/register-model';
import { RoleModel } from '../_models/role-model';
import { SaleModel } from '../_models/sale-model';
import { SalestaxModel } from '../_models/salestax-model';
import { SelproductModel } from '../_models/selproduct-model';
import { StoreModel } from '../_models/store-model';
import { SupplierModel } from '../_models/supplier-model';
import { TagModel } from '../_models/tag-model';
import { TimesheetModel } from '../_models/timesheet-model';
import { UserModel } from '../_models/user-model';
import { AddressModel } from '../_models/address-model';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private storage: SQLiteObject;
  songsList = new BehaviorSubject([]);
  upload_data = [];

  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);  

  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) {
    let config:SQLiteDatabaseConfig = {
      name: 'capos_db.db',
      location: 'default'
    }
    this.platform.ready().then(() => {      
      let sqlite = this.sqlite.create(config);
      if(sqlite){
        sqlite.then((db: SQLiteObject) => {
          this.storage = db;
          this.importData();
        });
      } else {
        this.isDbReady.next(true);
      }
    })    
  }

  dbState() {
    return this.isDbReady.asObservable();
  }
 
  fetchSongs(): Observable<Song[]> {
    return this.songsList.asObservable();
  }

  // import data
  importData() {
    this.httpClient.get(
      'assets/sqlite.sql', 
      {responseType: 'text'}
    ).subscribe(data => {      
      this.sqlPorter.importSqlToDb(this.storage, data)
        .then(_ => {
          this.getCountries();
          this.getCurrencies();
          this.isDbReady.next(true);          
        })
        .catch(error => console.error(error));
    });
  }

  // Get countries
  getCountries(callback?:Function){    
    this.storage.executeSql('SELECT * FROM countries', []).then(res => {      
      let countries:CountryModel[] = [];      
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          countries.push({ 
            _id: res.rows.item(i)._id,
            country_code: res.rows.item(i).country_code,
            country_name: res.rows.item(i).country_name,
            currency_code: res.rows.item(i).currency_code,
            iso_numeric: res.rows.item(i).iso_numeric,
            capital: res.rows.item(i).capital,
            continent_name: res.rows.item(i).continent_name,
            continent: res.rows.item(i).continent,
            languages: res.rows.item(i).languages,
            geo_name_id: res.rows.item(i).geo_name_id
           });
        }
      }
      if(callback) callback(countries);
    });
  }

  // Get currencies
  getCurrencies(callback?:Function){
    this.storage.executeSql('SELECT * FROM currencies', []).then(res => {      
      let currencies:CurrencyModel[] = [];      
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          currencies.push({ 
            _id: res.rows.item(i)._id,
            symbol: res.rows.item(i).symbol,
            name: res.rows.item(i).name,
            symbol_native: res.rows.item(i).symbol_native,
            decimal_digits: res.rows.item(i).decimal_digits,
            rounding: res.rows.item(i).rounding,
            code: res.rows.item(i).code,
            name_plural: res.rows.item(i).name_plural
           });
        }
      }
      if(callback) callback(currencies);
    });
  }

  getDbLogs(private_web_address:string, callback?:Function) {
    this.storage.executeSql('SELECT * FROM db_logs WHERE private_web_address=?', [private_web_address]).then(res => {      
      if(callback) callback(res.rows);
    });
  }

  updateDbLog(private_web_address:string, callback?:Function) {
    let query = '', values = [];
    this.getDbLogs(private_web_address, rows => {
      if(rows == 0) {
        query = 'INSERT INTO db_logs VALUES(?, ?, ?)';
        values = [private_web_address, (new Date()).getTime(), ''];
      } else {
        query = 'UPDATE db_logs SET loaded_date=?';
        values = [(new Date()).getTime()];
      }
      this.storage.executeSql(query, values).then(res => {
        if(callback) callback();
      })
    })    
  }

  private getModel(tb_name:string):any {
    let model: any;
    switch(tb_name) {
      case 'attributes':
        model = new AttributeModel();                        
        break;
      case 'brands':
        model = new BrandModel();        
        break;
      case 'bundles':
        model = new BundleModel();        
        break;
      case 'carts':
        model = new CartModel();        
        break;
      case 'cashes':
        model = new CashModel();        
        break;
      case 'collections':
        model = new CollectionModel();
        break;
      case 'countries':
        model = new CountryModel();
        break;
      case 'currencies':
        model = new CurrencyModel();
        break;
      case 'customers':
        model = new CustomerModel();
        break;
      case 'groups':
        model = new GroupModel();
        break;
      case 'onlieorders':
        model = new OnlineorderModel();
        break;
      case 'openclose':
        model = new OpencloseModel();
        break;
      case 'orders':
        model = new OrderModel();
        break;
      case 'outlets':
        model = new OutletModel();
        break;
      case 'paymenttypes':
        model = new PaymenttypeModel();
        break;
      case 'permissions':
        model = new PermissionModel();
        break;
      case 'pricebooks':
        model = new PricebookModel();
        break;
      case 'products':
        model = new ProductModel();
        break;
      case 'producttypes':
        model = new ProducttypeModel();
        break;
      case 'registers':
        model = new RegisterModel();
        break;
      case 'roles':
        model = new RoleModel();
        break;
      case 'sales':
        model = new SaleModel();
        break;
      case 'salestax':
        model = new SalestaxModel();
        break;
      case 'sel_products':
        model = new SelproductModel();
        break;
      case 'stores':
        model = new StoreModel();
        break;
      case 'suppliers':
        model = new SupplierModel();
        break;
      case 'tags':
        model = new TagModel();
        break;
      case 'timesheets':
        model = new TimesheetModel();
        break;
      case 'users':
        model = new UserModel();
        break;
    }
    return model;
  }

  downloadData(mode:string, tb_name: string, data:any[], callback?:Function) {
    if(!this.storage) {
      if(callback) callback(data.length);
      return;
    }
    let queries = [], model = this.getModel(tb_name);
    if(model) {
      queries = this.getQueriesToUpdate(tb_name, data, model, mode);          
    }
    if(queries.length>0) {
      this.executeQueries(queries, 0, data, callback);
    } else {
      if(callback) callback(data.length);
    }
  }  

  executeQueries(queries, index, data, callback) {
    let q = queries[index], query = '', values = [];
    if(q.mode == 'insert_data') {
      query = "INSERT INTO " + q.tb_name + "(" + q.columns.join(',') + ") " + q.fields.join(" UNION ALL ");
      values = q.values;
    }
    if(q.mode == 'update_data') {
      query = "UPDATE " + q.tb_name + " SET " + q.fields.join(',') + " WHERE _id=?";
      values = q.values;      
    }
    if(q.mode == 'delete_data') {
      query = "DELETE FROM " + q.tb_name + " WHERE " + q.id_field + " IN (" + q._ids.join(',') + ")";
      values = [];      
    }    
    this.storage.executeSql(query, values).then(res => {
      if(q.last || index == queries.length-1) {
        callback(data.length);
      } else {
        this.executeQueries(queries, index+1, data, callback);
      }
    });
  }

  getQueriesToUpdate(tb_name:string, data:any, model:any, mode:string) {
    let values = [], fields = [];
    let queries = [], m:any, v:any;
    if(mode == 'delete_data') {
      queries.push({mode: 'delete_data', tb_name: tb_name, id_field: '_id', _ids: data});
    }    
    switch(tb_name) {
      case 'attributes':
      case 'brands':        
      case 'countries':
      case 'currencies':
      case 'outlets':
      case 'paymenttypes':
      case 'permissions':
      case 'pricebooks':
      case 'producttypes':
      case 'registers':
      case 'roles':
      case 'salestax':
      case 'sel_products':
      case 'tags':
      case 'timesheets':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['start_date', 'end_date', 'validFrom', 'validTo', 'created_at', 'updated_at'], 
          ['is_main', 'touch', 'is_admin', 'is_cashier', 'is_manager']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});          
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, true, ['start_date', 'end_date', 'validFrom', 'validTo', 'created_at', 'updated_at'], 
          ['is_main', 'touch', 'is_admin', 'is_cashier', 'is_manager']);
        }        
        break;        
      case 'carts':
        if(mode == 'insert_data' || mode == 'update_data') {
          let user_id = '';
          if(data.length>0) user_id = data[0].user_id;
          queries.push({mode: 'delete_data', tb_name: tb_name, id_field: 'user_id', _ids: user_id});
          v = this.getDefaultFiedls(model, data, true, ['created_at']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        break;
      case 'bundles':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['active'], {s:['count1'], r:['count']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['active'], {s:['count1'], r:['count']});
          queries.push(this.getDeleteQuery('bundle_products', 'bundle_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'bundle_products', id_field: 'bundle_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new BundleProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, null, null, [{key:'bundle_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);            
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'bundle_products', values: values, fields: fields, columns: this.getColumns(m)});
        }        
        break;     
      case 'cashes':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['is_credit'], {s:['transaction1'], r:['transaction']});        
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, true, ['created_at'], ['is_credit'], {s:['transaction1'], r:['transaction']});
        }        
        break;
      case 'collections':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['active']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['active']);
          queries.push(this.getDeleteQuery('collection_products', 'collection_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'collection_products', id_field: 'collection_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new CollectionProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, null, null, [{key:'collection_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'collection_products', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;      
      case 'customers':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['exist_postal_address'], 
            {s:['custom_information1', 'custom_information2'], r: ['custom_information.field1', 'custom_information.field2']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['exist_postal_address'], 
          {s:['custom_information1', 'custom_information2'], r: ['custom_information.field1', 'custom_information.field2']});
          queries.push(this.getDeleteQuery('customer_pay_balance_logs', 'customer_id', data));
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'customer_pay_balance_logs', id_field: 'customer_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new CustomerPayBalanceLogsModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, null, null, [{key:'customer_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'customer_pay_balance_logs', values: values, fields: fields, columns: this.getColumns(m)});
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].physical_address) {
              v = this.getDefaultFiedls(m, [data[i].physical_address], i==0, null, null, null, 
                [{key:'model', value: 'customer'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'physical_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
            if(data[i].postal_address) {
              v = this.getDefaultFiedls(m, [data[i].postal_address], i==0, null, null, null, 
                [{key:'model', value: 'customer'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'postal_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'groups':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at', 'updated_at']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at', 'updated_at']);
          queries.push(this.getDeleteQuery('group_point_rates', 'group_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'group_point_rates', id_field: 'group_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new GroupPointRateModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].point_rates && data[i].point_rates.length>0) {
              v = this.getDefaultFiedls(m, data[i].point_rates, i==0, null, null, null, [{key:'group_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'group_point_rates', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'onlieorders':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], null, {s:['discount_mode', 'discount_value'], r:['discount.mode', 'discount.value']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], null, {s:['discount_mode', 'discount_value'], r:['discount.mode', 'discount.value']});
          queries.push(this.getDeleteQuery('onlineorder_products', 'order_id', data));
          queries.push(this.getDeleteQuery('onlineorder_payments', 'order_id', data));
          queries.push(this.getDeleteQuery('onlineorder_payment_status_history', 'order_id', data));
          queries.push(this.getDeleteQuery('onlineorder_status_history', 'order_id', data));
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'onlineorder_products', id_field: 'order_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'onlineorder_payments', id_field: 'order_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'onlineorder_payment_status_history', id_field: 'order_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'onlineorder_status_history', id_field: 'order_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){        
          m = new OnlineorderProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, null,
                {s:['discount_mode', 'discount_value', 'customer_name', 'customer_email', 'customer_company', 'customer_mobile'], 
                r:['discount.mode', 'discount.value', 'customer.name', 'customer.email', 'customer.company', 'customer.mobile']}, 
                [{key:'order_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'onlineorder_products', values: values, fields: fields, columns: this.getColumns(m)});        
          m = new OnlineorderPaymentModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].payments && data[i].payments.length>0) {
              v = this.getDefaultFiedls(m, data[i].payments, i==0, ['created_at'], null, null, [{key:'order_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'onlineorder_payments', values: values, fields: fields});
          m = new OnlineorderPaymentStatusHistoryModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].payment_status_history && data[i].payment_status_history.length>0) {
              v = this.getDefaultFiedls(m, data[i].payment_status_history, i==0, ['created_at'], null, null, [{key:'order_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'onlineorder_payment_status_history', values: values, fields: fields, columns: this.getColumns(m)});
          m = new OnlineorderStatusHistoryModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].status_history && data[i].status_history.length>0) {
              v = this.getDefaultFiedls(m, data[i].status_history, i==0, ['created_at'], null, null, [{key:'order_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'onlineorder_status_history', values: values, fields: fields, columns: this.getColumns(m)});
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].customer.billing_address) {
              v = this.getDefaultFiedls(m, [data[i].customer.billing_address], i==0, null, null, null, 
                [{key:'model', value: 'onlineorder'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'billing_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
            if(data[i].customer.shipping_address) {
              v = this.getDefaultFiedls(m, [data[i].customer.billing_address], i==0, null, null, null, 
                [{key:'model', value: 'onlineorder'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'shipping_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;      
      case 'openclose':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['opening_time', 'closing_time', 'created_at'], null, 
            {s: ['counted_cash', 'counted_credit', 'counted_debit'], r: ['counted.cash', 'counted.credit', 'counted.debit']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, true, ['opening_time', 'closing_time', 'created_at'], null, 
          {s: ['counted_cash', 'counted_credit', 'counted_debit'], r: ['counted.cash', 'counted.credit', 'counted.debit']});
        }
        break;
      case 'orders':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['delivery_date', 'created_at']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['delivery_date', 'created_at']);
          queries.push(this.getDeleteQuery('order_products', 'order_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'order_products', id_field: 'order_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new OrderProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, null, null, [{key:'order_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'order_products', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;      
      case 'outlets':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at']);
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].physical_address) {
              v = this.getDefaultFiedls(m, [data[i].physical_address], i==0, null, null, null, 
                [{key:'model', value: 'outlet'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'physical_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }          
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'products':        
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['enabled', 'tracking_inv', 'variant_inv', 'touch', 'featured', 
            'new_product', 'on_sale', 'hot_offer', 'price_prompt', 'food_stamp_item', 'serial_required', 'none_discount_item',
            'minus_price', 'scale_product', 'blank_cup_weight', 'has_no_price', 'refill_pd', 'customer_info_req', 'used_on_display1',
            'used_on_display2', 'price_not_changed_by_hq', 'cash_back', 'point_available', 'age_check_required', 'package_style',
            'discount_type', 'deposit_return']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['enabled', 'tracking_inv', 'variant_inv', 'touch', 'featured', 
          'new_product', 'on_sale', 'hot_offer', 'price_prompt', 'food_stamp_item', 'serial_required', 'none_discount_item',
          'minus_price', 'scale_product', 'blank_cup_weight', 'has_no_price', 'refill_pd', 'customer_info_req', 'used_on_display1',
          'used_on_display2', 'price_not_changed_by_hq', 'cash_back', 'point_available', 'age_check_required', 'package_style',
          'discount_type', 'deposit_return']);
          queries.push(this.getDeleteQuery('product_variant_products', 'product_id', data));
          queries.push(this.getDeleteQuery('product_variants', 'product_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'product_variant_products', id_field: 'product_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'product_variants', id_field: 'product_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new ProductVariantProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].variant_products && data[i].variant_products.length>0) {
              v = this.getDefaultFiedls(m, data[i].variant_products, i==0, null, ['enabled'], null, [{key:'product_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'product_variant_products', values: values, fields: fields, columns: this.getColumns(m)});
          m = new ProductVariantModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].variants && data[i].variants.length>0) {
              v = this.getDefaultFiedls(m, data[i].variants, i==0, null, null, null, [{key:'product_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'product_variants', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'sales':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['returned', 'voided'], {s:['discount_mode', 'discount_value'], r:['discount.mode', 'discount.value']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['returned', 'voided'], {s:['discount_mode', 'discount_value'], r:['discount.mode', 'discount.value']});
          queries.push(this.getDeleteQuery('sale_products', 'sale_id', data));
          queries.push(this.getDeleteQuery('sale_payments', 'sale_id', data));
          queries.push(this.getDeleteQuery('sale_voided_payments', 'sale_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'sale_products', id_field: 'sale_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'sale_payments', id_field: 'sale_id', _ids: data});
          queries.push({mode: 'delete_data', tb_name: 'sale_voided_payments', id_field: 'sale_id', _ids: data});
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new SaleProductModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].products && data[i].products.length>0) {
              v = this.getDefaultFiedls(m, data[i].products, i==0, null, ['voided'], 
                {s:['discount_mode', 'discount_value'], r:['discount.mode', 'discount.value']}, [{key:'sale_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'sale_products', values: values, fields: fields, columns: this.getColumns(m)});
          m = new SalePaymentModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].payments && data[i].payments.length>0) {
              v = this.getDefaultFiedls(m, data[i].payments, i==0, ['created_at'], null, null, [{key:'sale_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'sale_payments', values: values, fields: fields, columns: this.getColumns(m)});
          m = new SaleVoidedPaymentModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].voided_payments && data[i].voided_payments.length>0) {
              v = this.getDefaultFiedls(m, data[i].voided_payments, i==0, ['created_at'], null, null, [{key:'sale_id', value: data[i]._id}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'sale_voided_payments', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'stores':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['active', 'click_collect', 'store_pickup', 'paypal_active', 'stripe_active',
            'preferences_messagebox', 'preferences_confirm_delete_product', 'preferences_confirm_discard_sale', 'preferences_confirm_pay'], 
            {s:['social_link_facebook', 'social_link_twitter', 'social_link_linkedin', 'social_link_youtube', 'paypal_active', 'paypal_secret', 'paypal_client_id', 
            'stripe_active', 'stripe_secret_key', 'stripe_public_key', 
            'plan_id', 'plan_subscriptionId', 'preferences_messagebox', 'preferences_confirm_discard_sale', 'preferences_confirm_pay'], 
            r:['social_link.facebook', 'social_link.twitter', 'social_link.linkedin', 'social_link.youtube', 'paypal.active', 'papal.secret', 'paypal.client_id', 
            'stripe.active', 'stripe.secret_key', 'stripe.public_key', 
            'plan.id', 'plan.subscriptionId', 'preferences.messagebox', 'preferences.confirm_discard_sale', 'preferences.confirm_pay']});
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['active', 'click_collect', 'store_pickup', 'paypal_active', 'stripe_active',
          'preferences_messagebox', 'preferences_confirm_delete_product', 'preferences_confirm_discard_sale', 'preferences_confirm_pay'], 
          {s:['social_link_facebook', 'social_link_twitter', 'social_link_linkedin', 'social_link_youtube', 'paypal_active', 'paypal_secret', 'paypal_client_id', 
          'stripe_active', 'stripe_secret_key', 'stripe_public_key', 
          'plan_id', 'plan_subscriptionId', 'preferences_messagebox', 'preferences_confirm_discard_sale', 'preferences_confirm_pay'], 
          r:['social_link.facebook', 'social_link.twitter', 'social_link.linkedin', 'social_link.youtube', 'paypal.active', 'papal.secret', 'paypal.client_id', 
          'stripe.active', 'stripe.secret_key', 'stripe.public_key', 
          'plan.id', 'plan.subscriptionId', 'preferences.messagebox', 'preferences.confirm_discard_sale', 'preferences.confirm_pay']});
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});          
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].physical_address) {
              v = this.getDefaultFiedls(m, [data[i].physical_address], i==0, null, null, null, 
                [{key:'model', value: 'store'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'physical_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }          
            if(data[i].postal_address) {
              v = this.getDefaultFiedls(m, [data[i].postal_address], i==0, null, null, null, 
                [{key:'model', value: 'store'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'postal_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }          
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'suppliers':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['created_at'], ['exist_postal_address']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['created_at'], ['exist_postal_address']);
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});          
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].physical_address) {
              v = this.getDefaultFiedls(m, [data[i].physical_address], i==0, null, null, null, 
                [{key:'model', value: 'supplier'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'physical_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }          
            if(data[i].postal_address) {
              v = this.getDefaultFiedls(m, [data[i].postal_address], i==0, null, null, null, 
                [{key:'model', value: 'supplier'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'postal_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }          
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
      case 'users':
        if(mode == 'insert_data') {
          v = this.getDefaultFiedls(model, data, true, ['birthday', 'joined_date'], ['email_verify', 'is_in_training']);
          queries.push({mode: 'insert_data', tb_name: tb_name, values: v.values, fields: v.fields, columns: this.getColumns(model)});
        }
        if(mode == 'update_data') {
          queries = this.getUpdateQueries(model, data, tb_name, false, ['birthday', 'joined_date'], ['email_verify', 'is_in_training']);
          queries.push(this.getDeleteQuery('addresses', '_id', data));
        }
        if(mode == 'delete_data') {
          queries.push({mode: 'delete_data', tb_name: 'addresses', id_field: '_id', _ids: data});          
        }
        if(mode == 'insert_data' || mode == 'update_data'){
          m = new AddressModel();
          values = [], fields = [];
          for(let i=0;i<data.length;i++) {
            if(data[i].physical_address) {
              v = this.getDefaultFiedls(m, [data[i].physical_address], i==0, null, null, null, 
                [{key:'model', value: 'user'}, {key: '_id', value: data[i]._id}, {key: 'mode', value: 'physical_address'}]);
              fields = fields.concat(v.fields);
              values = values.concat(v.values);
            }
          }
          queries.push({mode: 'insert_data', tb_name: 'addresses', values: values, fields: fields, columns: this.getColumns(m)});
        }
        break;
    }
    for(let i=0;i<queries.length;i++) {
      queries[i].last = i<queries.length;
    }
    return queries;
  }

  getColumns(model:any) {
    let columns = [];
    for(let key in model) {            
      if(!['is_new', 'is_update', 'is_delete'].includes(key)) {
        columns.push(key);
      }
    }    
    return columns;
  }

  getFieldsToAdd(mode:string, model: any, is_first?: boolean) {
    let fds = [];
    for(let key in model) {            
      if(!['is_new', 'is_update', 'is_delete'].includes(key)) {
        if(mode == 'insert_data') {
          if(is_first) {
            fds.push("? AS '" + key + "'");
          } else {
            fds.push("?");
          }
        }
        if(mode == 'update_data') {
          fds.push(key + '=?');
        }
      }
    }    
    return fds; 
  }

  getDefaultFiedls(model:any, data:any, is_first:boolean, date_keys?:string[], boolean_keys?:string[], replace_keys?:any, default_values?:any[]) {
    let fds = [], fields = [], values = [];    
    for(let i=0;i<data.length;i++) {      
      fds = this.getFieldsToAdd('insert_data', model, i == 0 && is_first);          
      fields.push("SELECT " + fds.join(','));
      values = values.concat(this.getQueryValues(model, data[i], date_keys, boolean_keys, replace_keys, default_values));
    } 
    return {values: values, fields: fields};
  }

  getUpdateQueries(model:any, data:any, tb_name: string, is_last:boolean, date_keys?:string[], boolean_keys?:string[], replace_keys?:any, default_values?:any[]) {
    let queries = [], fields = [], values = [];
    fields = this.getFieldsToAdd('update_data', model);
    for(let i=0;i<data.length;i++) {
      values = this.getQueryValues(model, data[i], date_keys, boolean_keys, replace_keys, default_values);
      values.push(data[i]._id);
      queries.push({mode:'update_data', tb_name: tb_name, fields: fields, values: values});
    }
    return queries;
  }

  getDeleteQuery(tb_name:string, id_field:string, data:any[]) {
    let _ids = [];
    for(let i=0;i<data.length;i++) {      
      _ids.push(data[i]._id);       
    }
    return {mode:'delete_data', tb_name: tb_name, id_field: id_field, _ids: _ids};    
  }

  getQueryValues(model:any, data:any, date_keys?:string[], boolean_keys?:string[], replace_keys?:any, default_values?:any[]) {
    let values = [], p = -1;
    for(let key in model) {
      let value:any; let k = key;
      if(!['is_new', 'is_update', 'is_delete'].includes(k)) {          
        if(replace_keys) {
          p = replace_keys.s.indexOf(k);
          if(p>-1) k = replace_keys.r[p];
          let kk = k.split('.');
          value = data[kk[0]];
          if(kk.length>1) {
            for(let j=1;j<kk.length;j++) 
              if(value) value = value[kk[j]]; else break;              
          }
        } else {
          value = data[k];
        }
        p = -1;
        if(default_values) {
          p = default_values.findIndex(item => item.key == key);
        }
        if(default_values && p>-1) {
          value = default_values[p].value;
        } else if(typeof value == 'undefined') {
          if(typeof model[key] == 'string') value = '';
          if(typeof model[key] == 'number') value = 0;
        } else {
          if(date_keys && date_keys.includes(key)) {
            value = UtilFunc.getTime(data[k])
          } else if(boolean_keys && boolean_keys.includes(key)) {
            if(data[k] == '0' || !data[k]) {
              value = 0;
            } else {
              value = 1;
            }              
          }
        }
        if(Array.isArray(value)) value = value.join(',');
        values.push(value);
      }
    }    
    return values;
  }

  getUploadData(private_web_address:string, callback:Function) {
    let tb_names = ['attributes', 'brands', 'suppliers', 'tags', 'salestax', 'registers', 'outlets', 'products', 'bundles', 'cashes', 'collections', 'groups', 
      'customers', 'onlieorders', 'openclose', 'orders', 'paymenttypes', 'pricebooks', 'roles', 'sales', 'sel_products', 'stores', 'timesheets', 'users'];
    this.upload_data = [];
    this.getNewData(tb_names, 0, private_web_address, callback);
  }

  getNewData(tb_names:string[], index:number, private_web_address:string, callback:Function) {
    let tb_name = tb_names[index];
    this.storage.executeSql('SELECT * FROM ' + tb_name + ' WHERE private_web_address=? AND (is_new=? OR is_update=? OR is_delete=?)', [private_web_address, 1, 1, 1]).then(res => {
      if(res.rows.length>0) {
        this.upload_data.push({tb_name: tb_name, data: res.rows});
      }
      if(index < tb_names.length) {
        this.getNewData(tb_names, index+1, private_web_address, callback);
      } else {
        callback(this.upload_data);
      }
    })
  }

  // Add
  addSong(artist_name, song_name) {
    let data = [artist_name, song_name];
    return this.storage.executeSql('INSERT INTO songtable (artist_name, song_name) VALUES (?, ?)', data)
    .then(res => {
      // this.getSongs();
    });
  }
 
  // Get single object
  getSong(id): Promise<Song> {
    return this.storage.executeSql('SELECT * FROM songtable WHERE id = ?', [id]).then(res => { 
      return {
        id: res.rows.item(0).id,
        artist_name: res.rows.item(0).artist_name,  
        song_name: res.rows.item(0).song_name
      }
    });
  }

  // Update
  updateSong(id, song: Song) {
    let data = [song.artist_name, song.song_name];
    return this.storage.executeSql(`UPDATE songtable SET artist_name = ?, song_name = ? WHERE id = ${id}`, data)
    .then(data => {
      // this.getSongs();
    })
  }

  // Delete
  deleteSong(id) {
    return this.storage.executeSql('DELETE FROM songtable WHERE id = ?', [id])
    .then(_ => {
      // this.getSongs();
    });
  }
}
