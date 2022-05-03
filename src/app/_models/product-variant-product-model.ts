export class ProductVariantProductModel {
    _id: string = '';
    product_id: string = '';
    name: string = '';
    sku: string = '';
    supplier_code: string = '';
    supply_price: number = 0;
    retail_price: number = 0;
    enabled: number = 0;
    inventory: number = 0;
    reorder_point: number = 0;
    reorder_amount: number = 0;
    markup: number = 0;
    image: string = '';
    pair: string = '';
    pair_str: string = '';
}
