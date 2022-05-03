CREATE TABLE IF NOT EXISTS attributes(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    description VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS brands(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    description VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bundles(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    count1 INT,
    price FLOAT,
    discount FLOAT,
    active INT,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bundle_products(
    _id VARCHAR(255),    
    bundle_id VARCHAR(255),
    product_id VARCHAR(255),
    variant_id VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS carts(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    sale VARCHAR(255),
    created_at INT
);
CREATE TABLE IF NOT EXISTS cashes(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    outlet VARCHAR(255),
    register VARCHAR(255),
    reasons VARCHAR(255),
    transaction1 FLOAT,
    is_credit INT,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS collections(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    active INT,
    parent VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS collection_products(
    _id VARCHAR(255),
    collection_id VARCHAR(255),
    product_id VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS countries(
    _id VARCHAR(255),
    country_code VARCHAR(255),
    country_name VARCHAR(255),
    currency_code VARCHAR(255),
    iso_numeric VARCHAR(255),
    capital VARCHAR(255),
    continent_name VARCHAR(255),
    continent VARCHAR(255),
    languages VARCHAR(255),
    geo_name_id VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS currencies(
    _id VARCHAR(255),
    symbol  VARCHAR(255),
    name  VARCHAR(255),
    symbol_native  VARCHAR(255),
    decimal_digits INT,
    rounding INT,
    code  VARCHAR(255),
    name_plural VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS customers(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    groupId VARCHAR(255),
    email VARCHAR(255),
    code VARCHAR(255),
    company VARCHAR(255),
    birthday INT,
    gender VARCHAR(255) DEFAULT 'Male',
    website VARCHAR(255),
    twitter VARCHAR(255),
    mobile VARCHAR(255),
    phone VARCHAR(255),
    fax VARCHAR(255),
    exist_postal_address INT DEFAULT 0,
    note VARCHAR(255),
    custom_information1 VARCHAR(255),
    custom_information2 VARCHAR(255),
    total_spent FLOAT DEFAULT 0,
    debit FLOAT DEFAULT 0,
    credit FLOAT DEFAULT 0,
    total_issued FLOAT DEFAULT 0,
    total_redeemed FLOAT DEFAULT 0,
    point FLOAT DEFAULT 0,
    point_issued FLOAT DEFAULT 0,
    point_redeemed FLOAT DEFAULT 0,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS customer_pay_balance_logs(
    _id VARCHAR(255),
    customer_id VARCHAR(255),
    amount FLOAT DEFAULT 0,
    pay_type VARCHAR(255) DEFAULT 'cash',
    outlet VARCHAR(255),
    register VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS groups(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    mode VARCHAR(255),
    amount_limit FLOAT DEFAULT 0,
    created_at INT,
    updated_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS group_point_rates(
    _id VARCHAR(255),
    group_id VARCHAR(255),
    payment VARCHAR(255),
    rate FLOAT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS addresses(
    model VARCHAR(255),
    _id VARCHAR(255),
    mode VARCHAR(255),
    street VARCHAR(255),
    city VARCHAR(255),
    suburb VARCHAR(255),
    postcode VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS onlieorders(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    outlet VARCHAR(255),
    register VARCHAR(255),
    reference VARCHAR(255),
    customer_name VARCHAR(255),
    customer_company VARCHAR(255),
    customer_email VARCHAR(255),
    customer_mobile VARCHAR(255),
    payment_status VARCHAR(255),
    status VARCHAR(255),
    note VARCHAR(255),
    total FLOAT DEFAULT 0,
    subtotal FLOAT DEFAULT 0,
    tax FLOAT DEFAULT 0,
    discount_mode VARCHAR(255) DEFAULT 'percent',
    discount_value FLOAT DEFAULT 0,
    change FLOAT DEFAULT 0,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS onlineorder_products(
    _id VARCHAR(255),
    order_id VARCHAR(255),
    product_id VARCHAR(255),
    variant_id VARCHAR(255),
    product_name VARCHAR(255),
    variant_name VARCHAR(255),
    price FLOAT DEFAULT 0,
    qty INT DEFAULT 0,
    sign INT DEFAULT 1,
    tax FLOAT DEFAULT 0,
    discount_mode VARCHAR(255) DEFAULT 'percent',
    discount_value FLOAT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS onlineorder_payments(
    _id VARCHAR(255),
    order_id VARCHAR(255),
    pay_type VARCHAR(255) DEFAULT 'cash',
    amount FLOAT DEFAULT 0,
    created_at INT
);
CREATE TABLE IF NOT EXISTS onlineorder_payment_status_history(
    _id VARCHAR(255),
    order_id VARCHAR(255),
    status VARCHAR(255),
    created_at INT
);
CREATE TABLE IF NOT EXISTS onlineorder_status_history(
    _id VARCHAR(255),
    order_id VARCHAR(255),
    status VARCHAR(255),
    created_at INT
);
CREATE TABLE IF NOT EXISTS openclose(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    uid VARCHAR(255),
    user_id VARCHAR(255),
    outlet VARCHAR(255),
    register VARCHAR(255),
    opening_time INT,
    closing_time INT DEFAULT 0,
    open_value FLOAT,
    open_note VARCHAR(255),
    close_note VARCHAR(255),
    counted_cash FLOAT DEFAULT 0,
    counted_credit FLOAT DEFAULT 0,
    counted_debit FLOAT DEFAULT 0,
    status VARCHAR(255),
    closure_status VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    order_number VARCHAR(255),
    deliver_to VARCHAR(255),
    supplier VARCHAR(255),
    invoice_number VARCHAR(255),
    delivery_date INT,
    note VARCHAR(255),
    status VARCHAR(255) DEFAULT 'open',
    created_at INT,
    order_type VARCHAR(255) DEFAULT 'purchase',
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS order_products(
    _id VARCHAR(255),
    order_id VARCHAR(255),
    product_id VARCHAR(255),
    variant_id VARCHAR(255),
    product_name VARCHAR(255),
    variant_name VARCHAR(255),
    qty INT DEFAULT 0,
    supply_price FLOAT
);
CREATE TABLE IF NOT EXISTS outlets(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    register VARCHAR(255),
    orderNumber VARCHAR(255),
    defaultTax VARCHAR(255),
    timezone VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    twitter VARCHAR(255),
    created_at INT,
    is_main INT DEFAULT 0,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS paymenttypes(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    payments TEXT,
    others_name VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS permissions(
    _id VARCHAR(255),    
    uid VARCHAR(255),
    group_name VARCHAR(255),
    label VARCHAR(255),
    type_name VARCHAR(255),
    description VARCHAR(255),
    is_admin INT DEFAULT 0,
    is_cashier INT DEFAULT 0,
    is_manager INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS pricebooks(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    groupId VARCHAR(255),
    outletId VARCHAR(255),
    validFrom INT,
    validTo INT,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    name VARCHAR(255),
    handle VARCHAR(255),
    brand VARCHAR(255),
    producttype VARCHAR(255),
    sku VARCHAR(255),
    description TEXT,
    supplier VARCHAR(255),
    supplier_code VARCHAR(255),
    barcode VARCHAR(255),
    supply_price FLOAT DEFAULT 0,
    markup FLOAT DEFAULT 0,
    retail_price FLOAT DEFAULT 0,
    inventory INT DEFAULT 0,
    reorder_point INT DEFAULT 0,
    reorder_amount FLOAT DEFAULT 0,
    outlet VARCHAR(255),
    tax VARCHAR(255),
    tag TEXT,
    images TEXT,
    enabled INT DEFAULT 1,
    tracking_inv INT DEFAULT 1,
    variant_inv INT DEFAULT 0,
    touch INT DEFAULT 0,
    featured INT DEFAULT 0,
    new_product INT DEFAULT 0,
    on_sale INT DEFAULT 0,
    hot_offer INT DEFAULT 0,
    price_prompt INt DEFAULT 0,
    food_stamp_item INT DEFAULT 0,
    serial_required INT DEFAULT 0,
    none_discount_item INT DEFAULT 0,
    minus_price INT DEFAULT 0,
    scale_product INT DEFAULT 0,
    blank_cup_weight FLOAT DEFAULT 0,
    has_no_price INT DEFAULT 0,
    refill_pd INT DEFAULT 0,
    customer_info_req INT DEFAULT 0,
    used_on_display1 INT DEFAULT 0,
    used_on_display2 INT DEFAULT 0,
    price_not_changed_by_hq INT DEFAULT 0,
    cash_back INT DEFAULT 0,
    point_available INT DEFAULT 0,
    age_check_required INT DEFAULT 0,
    required_age INT DEFAULT 0,
    package_style INT DEFAULT 0,
    discount_type INT DEFAULT 0,
    deposit_return INT DEFAULT 0,
    created_at INT,    
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS product_variant_products(
    _id VARCHAR(255),
    product_id VARCHAR(255),
    name VARCHAR(255),
    sku VARCHAR(255),
    supplier_code VARCHAR(255),
    supply_price FLOAT DEFAULT 0,
    retail_price FLOAT DEFAULT 0,
    enabled INT DEFAULT 1,
    inventory INT DEFAULT 0,
    reorder_point INT DEFAULT 0,
    reorder_amount FLOAT DEFAULT 0,
    markup INT DEFAULT 0,
    image VARCHAR(255),
    pair VARCHAR(255),
    pair_str VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS product_variants(
    _id VARCHAR(255),
    product_id VARCHAR(255),
    attribute VARCHAR(255),
    attr_value TEXT
);
CREATE TABLE IF NOT EXISTS producttypes(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    description VARCHAR(255),
    slug VARCHAR(255),
    touch INT DEFAULT 1,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS registers(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    outlet VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS roles(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    permissions TEXT,
    udpated_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sales(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    store_name VARCHAR(255),
    outlet VARCHAR(255),
    register VARCHAR(255),
    sale_number VARCHAR(255),
    payment_status VARCHAR(255) DEFAULT 'not paid',
    sale_status VARCHAR(255) DEFAULT 'usual',
    note VARCHAR(255),
    customer VARCHAR(255),
    total FLOAT DEFAULT 0,
    subtotal FLOAT DEFAULT 0,
    total_paid FLOAT DEFAULT 0,
    total_item INT DEFAULT 0,
    tax FLOAT DEFAULT 0,
    discount_mode VARCHAR(255) DEFAULT 'percent',
    discount_value FLOAT DEFAULT 0,
    change FLOAT DEFAULT 0,
    fulfillment_mode VARCHAR DEFAULT 'delivery',
    fulfullment_customer VARCHAR(255),
    fulfillment_email VARCHAR(255),
    fulfillment_mobile VARCHAR(255),
    fulfillment_phone VARCHAR(255),
    fulfillment_fax VARCHAR(255),
    cart_mode VARCHAR(255) DEFAULT 'new',
    returned INT DEFAULT 0,
    voided INT DEFAULT 0,
    origin_customer VARCHAR(255),
    origin_sale_number VARCHAR(255),
    origin_status VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sale_products(
    _id VARCHAR(255),
    sale_id VARCHAR(255),
    product_id VARCHAR(255),
    variant_id VARCHAR(255),
    product_name VARCHAR(255),
    variant_name VARCHAR(255),
    price FLOAT DEFAULT 0,
    qty INT DEFAULT 0,
    sign INT DEFAULT 1,
    tax FLOAT DEFAULT 0,
    discount_mode VARCHAR(255) DEFAULT 'percent',
    discount_value FLOAT DEFAULT 0,
    note VARCHAR(255),
    blank_cup_weight INT DEFAULT 0,
    serial_number VARCHAR(255),
    weight FLOAT DEFAULT 0,
    voided INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sale_payments(
    _id VARCHAR(255),
    sale_id VARCHAR(255),
    pay_type VARCHAR(255) DEFAULT 'cash',
    amount FLOAT DEFAULT 0,
    created_at INT
);
CREATE TABLE IF NOT EXISTS sale_voided_payments(
    _id VARCHAR(255),
    sale_id VARCHAR(255),
    pay_type VARCHAR(255) DEFAULT 'cash',
    amount FLOAT DEFAULT 0,
    created_at INT
);
CREATE TABLE IF NOT EXISTS salestax(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    rate FLOAT,
    create_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sel_products(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),
    products TEXT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS stores(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    store_name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    domain_name VARCHAR(255),
    profile_image VARCHAR(255),
    logo VARCHAR(255),
    social_link_facebook VARCHAR(255),
    social_link_twitter VARCHAR(255),
    social_link_linkedin VARCHAR(255),
    social_link_youtube VARCHAR(255),
    website VARCHAR(255),
    sequence_number INT,
    default_currency VARCHAR(255),
    default_tax VARCHAR(255),
    template VARCHAR(255),
    user_switch_security INT DEFAULT 1,
    active INT DEFAULT 1,
    click_collect INT DEFAULT 0,
    store_pickup INT DEFAULT 1,
    paypal_active INT DEFAULT 0,
    paypal_secret VARCHAR(255),
    paypal_client_id VARCHAR(255),
    stripe_active INT DEFAULT 0,
    stripe_secret_key VARCHAR(255),
    stripe_public_key VARCHAR(255),
    plan_id VARCHAR(255) DEFAULT 'free',
    plan_subscriptionId VARCHAR(255),
    preferences_messagebox INT DEFAULT 1,
    preferences_confirm_delete_product INT DEFAULT 1,
    preferences_confirm_discard_sale INT DEFAULT 1,
    preferences_confirm_pay INT DEFAULT 1,
    short_description VARCHAR(255),
    theme_color VARCHAR(255),
    created_at INT DEFAULT 0,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS suppliers(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    markup FLOAT DEFAULT 0,
    description VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    mobile VARCHAR(255),
    fax VARCHAR(255),
    website VARCHAR(255),
    twitter VARCHAR(255),
    exist_postal_address INT DEFAULT 0,
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tags(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    name VARCHAR(255),
    created_at INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS timesheets(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id VARCHAR(255),    
    start_date INT,
    end_date INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS users(
    _id VARCHAR(255),
    private_web_address VARCHAR(255),
    user_id INT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    password TEXT,
    birthday INT,
    phone VARCHAR(255),
    mobile VARCHAR(255),
    email_verify INT DEFAULT 0,
    outlet VARCHAR(255),
    commission FLOAT DEFAULT 0,
    hour_salary FLOAT DEFAULT 0,
    is_in_training INT DEFAULT 0,
    ip_address VARCHAR(255),
    role_id VARCHAR(255),
    joined_date INT,
    is_new INT DEFAULT 0,
    is_update INT DEFAULT 0,
    is_delete INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS db_logs(
    private_web_address VARCHAR(255),
    loaded_date INT,
    updated_tables TEXT
);