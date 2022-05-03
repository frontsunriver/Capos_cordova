import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LongPressModule } from 'ionic-long-press';

import { HeaderComponent } from '../components/header/header.component';
import { UserMenuComponent } from '../components/user-menu/user-menu.component';
import { UserSwitchComponent } from '../components/user-switch/user-switch.component';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { EditTaxComponent } from '../components/edit-tax/edit-tax.component';
import { TableComponent } from '../components/table/table.component';
import { TableColumnsComponent } from '../components/table-columns/table-columns.component';
import { RegistersComponent } from '../components/registers/registers.component';
import { EditRegisterComponent } from '../components/edit-register/edit-register.component';
import { ConfirmSubscriptionComponent } from '../components/confirm-subscription/confirm-subscription.component';
import { SearchSalesLedgerComponent } from '../components/search-sales-ledger/search-sales-ledger.component';
import { EditCashComponent } from '../components/edit-cash/edit-cash.component';
import { SearchCashComponent } from '../components/search-cash/search-cash.component';
import { SearchSaleComponent } from '../components/search-sale/search-sale.component';
import { SaleDetailComponent } from '../components/sale-detail/sale-detail.component';
import { CashDetailComponent } from '../components/cash-detail/cash-detail.component';
import { ChooseCustomerComponent } from '../components/choose-customer/choose-customer.component';
import { AddToCartComponent } from '../components/add-to-cart/add-to-cart.component';
import { ProductVariantsComponent } from '../components/product-variants/product-variants.component';
import { PriceWeightComponent } from '../components/price-weight/price-weight.component';
import { SaleNoteComponent } from '../components/sale-note/sale-note.component';
import { ConfirmPasswordComponent } from '../components/confirm-password/confirm-password.component';
import { DiscountComponent } from '../components/discount/discount.component';
import { QuantityComponent } from '../components/quantity/quantity.component';
import { UnfulfilledSaleComponent } from '../components/unfulfilled-sale/unfulfilled-sale.component';
import { RetrieveSaleComponent } from '../components/retrieve-sale/retrieve-sale.component';
import { PayAmountComponent } from '../components/pay-amount/pay-amount.component';
import { PayChangeComponent } from '../components/pay-change/pay-change.component';
import { SearchSalesReportComponent } from '../components/search-sales-report/search-sales-report.component';
import { SearchInventoryReportComponent } from '../components/search-inventory-report/search-inventory-report.component';
import { SearchRegisterClosureComponent } from '../components/search-register-closure/search-register-closure.component';
import { RegisterDetailComponent } from '../components/register-detail/register-detail.component';
import { SearchStoreCreditComponent } from '../components/search-store-credit/search-store-credit.component';
import { LinkedProductsComponent } from '../components/linked-products/linked-products.component';
import { EditAttributeComponent } from '../components/edit-attribute/edit-attribute.component';
import { SearchKeywordComponent } from '../components/search-keyword/search-keyword.component';
import { EditProductTagComponent } from '../components/edit-product-tag/edit-product-tag.component';
import { EditProductBrandComponent } from '../components/edit-product-brand/edit-product-brand.component';
import { EditProductSupplierComponent } from '../components/edit-product-supplier/edit-product-supplier.component';
import { EditProductTypeComponent } from '../components/edit-product-type/edit-product-type.component';
import { EditPriceBookComponent } from '../components/edit-price-book/edit-price-book.component';
import { SearchPriceBookComponent } from '../components/search-price-book/search-price-book.component';
import { BundleDetailComponent } from '../components/bundle-detail/bundle-detail.component';
import { EditBundleComponent } from '../components/edit-bundle/edit-bundle.component';
import { AutoCompleteModule } from 'ionic4-auto-complete';
import { SearchProductService } from '../_services/search-product.service';
import { ChooseVariantsComponent } from '../components/choose-variants/choose-variants.component';
import { AddToBundleComponent } from '../components/add-to-bundle/add-to-bundle.component';
import { ProductDetailComponent } from '../components/product-detail/product-detail.component';
import { EditProductComponent } from '../components/edit-product/edit-product.component';
import { SearchProductComponent } from '../components/search-product/search-product.component';
import { NewItemComponent } from '../components/new-item/new-item.component';
import { TagInputModule } from 'ngx-chips';
import { EditVariantComponent } from '../components/edit-variant/edit-variant.component';
import { EditAttributeValuesComponent } from '../components/edit-attribute-values/edit-attribute-values.component';
import { EditGroupComponent } from '../components/edit-group/edit-group.component';
import { EditCustomerComponent } from '../components/edit-customer/edit-customer.component';
import { SearchCustomerComponent } from '../components/search-customer/search-customer.component';
import { CustomerDetailComponent } from '../components/customer-detail/customer-detail.component';
import { EditRoleComponent } from '../components/edit-role/edit-role.component';
import { EditEmployeeComponent } from '../components/edit-employee/edit-employee.component';
import { SearchEmployeeComponent } from '../components/search-employee/search-employee.component';
import { EditTimesheetComponent } from '../components/edit-timesheet/edit-timesheet.component';
import { EditOrderStockComponent } from '../components/edit-order-stock/edit-order-stock.component';
import { SearchOrderStockComponent } from '../components/search-order-stock/search-order-stock.component';
import { OrderVariantsComponent } from '../components/order-variants/order-variants.component';
import { EditVariantQtyComponent } from '../components/edit-variant-qty/edit-variant-qty.component';
import { OrderDetailComponent } from '../components/order-detail/order-detail.component';
import { AddToOrderComponent } from '../components/add-to-order/add-to-order.component';
import { EditOrderStockContentComponent } from '../components/edit-order-stock-content/edit-order-stock-content.component';
import { EditCollectionComponent } from '../components/edit-collection/edit-collection.component';
import { AddToCollectionComponent } from '../components/add-to-collection/add-to-collection.component';
import { AddToOnlineOrderComponent } from '../components/add-to-online-order/add-to-online-order.component';
import { EditOnlineOrderProductComponent } from '../components/edit-online-order-product/edit-online-order-product.component';
import { SearchOnlineOrderComponent } from '../components/search-online-order/search-online-order.component';
import { OnlineOrderDetailComponent } from '../components/online-order-detail/online-order-detail.component';
import { EditOnlineOrderComponent } from '../components/edit-online-order/edit-online-order.component';
import { OnlineOrderVariantsComponent } from '../components/online-order-variants/online-order-variants.component';
import { ColorPicker } from '../components/color-picker/color-picker';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        HttpClientModule,
        LongPressModule,
        AutoCompleteModule,
        TagInputModule
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HeaderComponent,
        UserMenuComponent,
        UserSwitchComponent,
        ProductListComponent,
        EditTaxComponent,
        TableComponent,
        TableColumnsComponent,
        RegistersComponent,
        EditRegisterComponent,
        ConfirmSubscriptionComponent,
        SearchSalesLedgerComponent,
        EditCashComponent,
        SearchCashComponent,
        SearchSaleComponent,
        SaleDetailComponent,
        CashDetailComponent,
        ChooseCustomerComponent,
        AddToCartComponent,
        ProductVariantsComponent,
        PriceWeightComponent,
        SaleNoteComponent,
        ConfirmPasswordComponent,
        DiscountComponent,
        QuantityComponent,
        UnfulfilledSaleComponent,
        RetrieveSaleComponent,
        PayAmountComponent,
        PayChangeComponent,
        SearchSalesReportComponent,
        SearchInventoryReportComponent,
        SearchRegisterClosureComponent,
        RegisterDetailComponent,
        SearchStoreCreditComponent,
        LinkedProductsComponent,
        EditAttributeComponent,
        SearchKeywordComponent,
        EditProductTagComponent,
        EditProductBrandComponent,
        EditProductSupplierComponent,
        EditProductTypeComponent,
        EditPriceBookComponent,
        SearchPriceBookComponent,
        BundleDetailComponent,
        EditBundleComponent,
        ChooseVariantsComponent,
        AddToBundleComponent,
        ProductDetailComponent,
        EditProductComponent,
        SearchProductComponent,
        NewItemComponent,
        EditVariantComponent,
        EditAttributeValuesComponent,
        EditGroupComponent,
        EditCustomerComponent,
        SearchCustomerComponent,
        CustomerDetailComponent,
        EditRoleComponent,
        EditEmployeeComponent,
        SearchEmployeeComponent,
        EditTimesheetComponent,
        EditOrderStockComponent,
        SearchOrderStockComponent,
        OrderVariantsComponent,
        EditVariantQtyComponent,
        OrderDetailComponent,
        AddToOrderComponent,
        EditOrderStockContentComponent,
        EditCollectionComponent,
        AddToCollectionComponent,
        AddToOnlineOrderComponent,
        EditOnlineOrderProductComponent,
        SearchOnlineOrderComponent,
        OnlineOrderDetailComponent,
        EditOnlineOrderComponent,
        OnlineOrderVariantsComponent,
        ColorPicker
    ],
    declarations: [
        HeaderComponent,
        UserMenuComponent,
        UserSwitchComponent,
        ProductListComponent,
        EditTaxComponent,
        TableComponent,
        TableColumnsComponent,
        RegistersComponent,
        EditRegisterComponent,
        ConfirmSubscriptionComponent,
        SearchSalesLedgerComponent,
        EditCashComponent,
        SearchCashComponent,
        SearchSaleComponent,
        SaleDetailComponent,
        CashDetailComponent,
        ChooseCustomerComponent,
        AddToCartComponent,
        ProductVariantsComponent,
        PriceWeightComponent,
        SaleNoteComponent,
        ConfirmPasswordComponent,
        DiscountComponent,
        QuantityComponent,
        UnfulfilledSaleComponent,
        RetrieveSaleComponent,
        PayAmountComponent,
        PayChangeComponent,
        SearchSalesReportComponent,
        SearchInventoryReportComponent,
        SearchRegisterClosureComponent,
        RegisterDetailComponent,
        SearchStoreCreditComponent,
        LinkedProductsComponent,
        EditAttributeComponent,
        SearchKeywordComponent,
        EditProductTagComponent,
        EditProductBrandComponent,
        EditProductSupplierComponent,
        EditProductTypeComponent,
        EditPriceBookComponent,
        SearchPriceBookComponent,
        BundleDetailComponent,
        EditBundleComponent,
        ChooseVariantsComponent,
        AddToBundleComponent,
        ProductDetailComponent,
        EditProductComponent,
        SearchProductComponent,
        NewItemComponent,
        EditVariantComponent,
        EditAttributeValuesComponent,
        EditGroupComponent,
        EditCustomerComponent,
        SearchCustomerComponent,
        CustomerDetailComponent,
        EditRoleComponent,
        EditEmployeeComponent,
        SearchEmployeeComponent,
        EditTimesheetComponent,
        EditOrderStockComponent,
        SearchOrderStockComponent,
        OrderVariantsComponent,
        EditVariantQtyComponent,
        OrderDetailComponent,
        AddToOrderComponent,
        EditOrderStockContentComponent,
        EditCollectionComponent,
        AddToCollectionComponent,
        AddToOnlineOrderComponent,
        EditOnlineOrderProductComponent,
        SearchOnlineOrderComponent,
        OnlineOrderDetailComponent,
        EditOnlineOrderComponent,
        OnlineOrderVariantsComponent,
        ColorPicker
    ],
    providers: [
        SQLite,
        SQLitePorter,
        SearchProductService
    ]
})
export class ShareModule { }