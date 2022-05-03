export class OrderModel {
    _id: string = '';
    private_web_address: string = '';
    user_id: string = '';
    order_number: string = '';
    deliver_to: string = '';
    supplier: string = '';
    invoice_number: string = '';
    delivery_date: number = 0;
    note: string = '';
    status: string = '';
    created_at: number = 0;
    order_type: string = '';
    is_new: number = 0;
    is_update: number = 0;
    is_delete: number = 0;
}
