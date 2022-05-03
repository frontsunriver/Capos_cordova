import { environment } from "src/environments/environment";

export const APP_CONSTANTS = {
  APP_TITLE: environment.appTitle,
  SERVER_URL: environment.serverUrl,
  API_URL: environment.apiUrl,
  IS_PRODUCT: environment.production,
  IS_FRONT: environment.staging,
  PAYPAL: {
    CLIENT_ID: environment.paypal.clientId,
    SECRET: environment.paypal.secret
  },
  PLANS: {
    FREE: environment.plans.free,
    STARTER: environment.plans.starter,
    ADVANCED: environment.plans.advanced,
    MULTI_OUTLET: environment.plans.multi_outlet
  }
};

export const Constants = {
    message: {
      validEmail: 'Please enter valid email address',
      invalidMinLength: 'This field must be longer than ? letters',
      invalidMaxLength: 'This field must be less than ? letters',
      duplicatedEmail: 'This email is already in use',
      requiredField: 'This field is required',
      invalidMinValue: 'This value must be greater than ?',
      invalidMaxValue: 'This value must be less than ?',
      successLogin: 'You logged in successfully',
      successSwitch: 'User has been switched successfully',
      notVerifiedEmail: 'Please verify your email',
      noExistingUser: 'No Existing User',
      noExistingCustomer: 'No Existing Customer',
      noExistingEmployee: 'No Existing Employee',
      successSaved: 'Successfully saved',
      successRemoved: 'Successfully removed',
      successVoided: 'Successfully voided',
      failedSave: 'Failed to save',
      failedRemove: 'Failed to remove',
      invalidFields: 'Please enter fields correctly',
      duplicateItem: 'Already existing ?',
      product_contains: 'Can not remove this attribute because some products contain this one.',
      successUpload: 'Successfully uploaded',
      failedUpload: 'Failed to upload',
      noExistingProduct: 'No Existing Product',
      validPassword: 'Valid Password. You can add discount',
      notAllowedDiscount: 'You have no permission to apply discount',
      invalidCartProducts: 'Please add at least one product',
      successAddedToCart: 'Successfully added to cart',
      successComplete: 'Successfully completed',
      successOpenRegister: 'Resiter opened successfully.',
      sale: {
        completed: 'Sale has been completed successfully',
        parked: 'Sale has been parked successfully',
        discard: 'Sale has been discarded successfully',
        quote: 'Sale has been quoted successfully',
        delivery_unfulfilled: 'Sale has been marked as unfulfilled for delivery',
        pickup_unfulfilled: 'Sale has been marked as unfulfilled for pickup',
        layby: 'Sale has been saved as Layby',
        on_account: 'Sale has been saved as On Account',
        quoted: 'Sale has been quoted successfully'
      },
      sale_note: {
        park: 'You are about to park this sale. Add a note so it can be identified by the next person who continues this sale.',
        quote: 'You are about to quote this sale. Add a note so it can be identified by the person who completes this sale.'      
      }
    },  
    completed_status: ['layby_completed', 'completed', 'on_account_completed', 'delivery_completed', 'pickup_completed'],
    continue_status: ['layby', 'parked', 'on_account'],
    unfulfilled_status: ['delivery_unfulfilled', 'pickup_unfulfilled'],
    paid_status: ['on_account', 'completed', 'layby_completed', 'on_account_completed', 'delivery_completed', 'pickup_completed', 'return_completed'],
    password:{minLength: 6, maxLength: 20},
    open_value:{min: 1},
    securities : [
      {id: 0, name: 'Never require a password when switching between users.'},
      {id: 1, name: 'Require a password when switching to a user with greater privileges.'},
      {id: 2, name: 'Always require a password when switching between users'}
    ],
    cash_transaction : {min: 1},
    discount: {min: 1},  
    sale_status : [
      {value: 'new', label: 'New Sale'},
      {value: 'layby', label: 'LayBy'},
      {value: 'on_account', label: 'On Account'},
      {value: 'parked', label: 'Parked'},
      {value: 'delivery_unfulfilled', label: 'Delivery,unfulfilled'},
      {value: 'pickup_unfulfilled', label: 'Pickup,unfulfilled'},
      {value: 'completed', label: 'Completed'},
      {value: 'layby_completed', label: 'LayBy,completed'},
      {value: 'on_account_completed', label: 'On Account,completed'},
      {value: 'delivery_completed', label: 'Delivery,completed'},
      {value: 'pickup_completed', label: 'Pickup,completed'},
      {value: 'return_completed', label: 'Return,completed'},
      {value: 'voided', label: 'Voided'}
    ],
    order_status : [
      {code: 'awaiting', label:'Awaiting Payment'}, 
      {code: 'allocated', label: 'Allocated'}, 
      {code: 'shipped', label: 'Shipped'}, 
      {code: 'quote', label: 'Quote'}
    ],
    payment_status : [
      {code: 'not_paid', label: 'Not Paid'}, 
      {code: 'full_paid', label: 'Fully Paid'}, 
      {code: 'partial_paid', label: 'Partially Paid'}
    ],
    plans: [
      // {
      //   id: 'free',
      //   label: 'Basic',
      //   price: 0,
      //   features: [
      //     ['Single Outlet', '1 Register only'],
      //     ['1 User only', 'upto 10 products only', 'upto 1000 customers only'],
      //     ['Community support']
      //   ]
      // },
      {
        id: 'starter',
        label: 'Starter',
        price: 69,
        features: [
          ['Single Outlet', '1 Register only'],
          ['up to 3 users only', 'Unlimited products & customers'],
          ['Loyalty', 'Advance reporting'],
          ['Email & Chat Support']
        ]
      },
      {
        id: 'advanced',
        label: 'Advanced',
        price: 89,
        features: [
          ['Start with 1 register (add more as you grow)'],
          ['up to 3 users', 'Unlimited products, customers'],
          ['Gift cards', 'Loyalty', 'Ecommerece', 'Advance Reporting', 'Advanced User Permissions'],
          ['Email & Chat Support']
        ]
      },
      // {
      //   id: 'multi_outlet',
      //   label: 'Multi Outlet',
      //   price: 199,
      //   features: [
      //     ['Single Outlet', 'Start with 2 registers (add more as you grow)'],
      //     ['Unlimited products, users & customers'],
      //     ['Multi-outlet inventory', 'Central customer database', 'HQ and outlet reporting', 'Timezone support', 'Consolidated billing and admin'],
      //     ['Priority Phone Support']
      //   ]
      // }
    ],
    dashboardItems: [
      {
        label: 'Dashboard',
        link: 'home',
        imageIcon: 'assets/icon/home.png',
      },
      {
        label: 'Sell',
        imageIcon: 'assets/icon/sell.png',
        items: [
          {
            label: 'Sell',
            link: 'sell/selling',
          },
          {
            label: 'Open/Close',
            link: 'sell/open-register',
          },
          {
            label: 'Sales History',
            link: 'sell/sales-history',
          },
          {
            label: 'Quoted Sales',
            link: 'sell/quoted-sales',
          },
          {
            label: 'Cash Management',
            link: 'sell/cash-management',
          }
        ]
      },
      {
        label: 'Sales Ledger',
        link: 'sales-ledger',
        imageIcon: 'assets/icon/sales-ledger.png',
      },
      {
        label: 'Reporting',
        imageIcon: 'assets/icon/reporting.png',
        items: [
          {
            label: 'Sales Reports',
            link: 'reporting/sales',
          },
          {
            label: 'Inventory Reports',
            link: 'reporting/inventory',
          },
          {
            label: 'Payment Reports',
            link: 'reporting/payment',
          },
          {
            label: 'Register Closures',
            link: 'reporting/closures',
          },
          {
            label: 'Store Credit Reports',
            link: 'reporting/store-credit',
          }
        ]
      },
      {
        label: 'Products',
        imageIcon: 'assets/icon/products.png',
        items: [
          {
            label: 'Products',
            link: 'product/product',
          },
          {
            label: 'Mix & Match',
            link: 'product/mix-and-match',
          },
          {
            label: 'Price Books',
            link: 'product/price-books',
          },
          {
            label: 'Product Types',
            link: 'product/product-type',
          },
          {
            label: 'Suppliers',
            link: 'product/supplier',
          },
          {
            label: 'Brand',
            link: 'product/brand',
          },
          {
            label: 'Product Tags',
            link: 'product/product-tag',
          },
          {
            label: 'Product Attributes',
            link: 'product/attribute',
          }
        ]
      },
      {
        label: 'Stock Control',
        imageIcon: 'assets/icon/stock-control.png',
        items: [
          {
            label: 'Manage Orders',
            link: 'stock-control/manage-orders',
          },
          {
            label: 'Receive Stock',
            link: 'stock-control/receive-stock',
          },
          {
            label: 'Return Stock',
            link: 'stock-control/return-stock',
          },
        ]
      },
      {
        label: 'Customers',
        imageIcon: 'assets/icon/customers.png',
        items: [
          {
            label: 'Customers',
            link: 'customers/customers',
          },
          {
            label: 'Groups',
            link: 'customers/group',
          },
        ]
      },
      {
        label: 'Employees',
        imageIcon: 'assets/icon/employees.png',
        items: [
          {
            label: 'User/Employees',
            link: 'employees/employees',
          },
          {
            label: 'Roles',
            link: 'employees/roles',
          },
        ]
      },
      {
        label: 'Ecommerce',
        imageIcon: 'assets/icon/ecommerce.png',
        items: [
          {
            label: 'Dashboard',
            link: 'ecommerce/dashboard',
          },
          {
            label: 'Collections',
            link: 'ecommerce/collections',
          },
          {
            label: 'Products',
            link: 'ecommerce/product',
          },
          {
            label: 'Orders',
            link: 'ecommerce/orders',
          },
          {
            label: 'Settings',
            link: 'ecommerce/settings',
          },
          // {
          //   label: 'Pages',
          //   link: 'ecommerce/pages',
          // },
          // {
          //   label: 'Visit Online Store',
          //   link: '/online-store/',
          //   externalRedirect: true,
          //   hrefTargetType: '_blank'
          // },
        ]
      },
      {
        label: 'Setup',
        imageIcon: 'assets/icon/setup.png',
        items: [
          {
            label: 'General',
            link: 'setup/general',
          },
          {
            label: 'Billing & Subscriptions',
            link: 'setup/subscription',
          },
          {
            label: 'Outlets and Register',
            link: 'setup/outlets',
          },
          {
            label: 'Payment Types',
            link: 'setup/payment-types',
          },
          {
            label: 'Customer Point & Gift',
            link: 'setup/customer-point-gift',
          },
          {
            label: 'Sales Taxes',
            link: 'setup/sales-taxes',
          },       
          {
            label: 'Station',
            link: 'setup/station'
          }, 
          {
            label: 'Store Management',
            link: 'setup/store-management'
          },
          {
            label: 'Store Policy',
            link: 'setup/store-policy',
          },        
          {
            label: 'Preferences',
            link: 'setup/preferences',
          },
        ]
      },
    ],
    dashboardConfig: {
      paddingAtStart: true,
      classname: 'capos-side-menu',
      collapseOnSelect: true,
      useDividers: false
    },
    baseUrl: {
      dev: '',
      prod: ''
    }
  };

  
export const StoreConstants = {
  theme_color: '00c0f0',
  currencies: ['USD', 'EUR'],
  flags: [
      { name:'English', image: 'assets/images/flags/gb.svg' },
      { name:'German', image: 'assets/images/flags/de.svg' },
      { name:'French', image: 'assets/images/flags/fr.svg' },
      { name:'Russian', image: 'assets/images/flags/ru.svg' },
      { name:'Turkish', image: 'assets/images/flags/tr.svg' }
  ],
  default_sliders: [
    {
      title: 'Huge sale', 
      subtitle:'Up to 70%', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'Biggest discount', 
      subtitle:'Check the promotion', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'Biggest sale', 
      subtitle:'Dont miss it', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'Our best products', 
      subtitle:'Special selection', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'Massive sale', 
      subtitle:'Only for today', 
      button: 'Shop Now', 
      href:'',
      image: ''
    }
  ],
  default_banner_images: [
    'assets/images/product/laptop.png', 'assets/images/product/tablet.png', 'assets/images/product/cameras.png', 'assets/images/product/mobiles.png'
  ],  
  default_banners: [
    {
      title: 'NEW LAPTOPS', 
      subtitle:'Sale up to 30% off all products in the new collection.', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'TABLETS, SMARTPHONES AND MORE', 
      subtitle:'Sale up to 30%.', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'NEW CAMERAS COLLECTION', 
      subtitle:'Sale up to 30%.', 
      button: 'Shop Now', 
      href:'',
      image: ''
    },
    {
      title: 'CACH BIG OFFERS ON CAMERAS', 
      subtitle:'Sale up to 20%.', 
      button: '$66.00', 
      href:'',
      image: ''
    }
  ],
  default_services: [
    {
      name: 'BONUS PLUS',
      description: 'Get a bonus plus for buying more that three products',
      icon: 'card_giftcard'
    },
    {
      name: 'FREE SHIPPING',
      description: 'Free shipping on all orders over $99',
      icon: 'local_shipping'
    },
    {
      name: 'MONEY BACK GUARANTEE',
      description: '100% money back guarantee',
      icon: 'monetization_on'
    },
    {
      name: 'ONLINE SUPPORT 24/7',
      description: 'Call us: 02 3555 65454 55',
      icon: 'history'
    }
  ],
  navItems: [
    {
      displayName: 'Home',
      iconName: 'recent_actors',
      route: '/home'
    },
    {
      displayName: 'Categories',
      iconName: 'feedback',
      children: [
        {
          displayName: 'All Categories',
          iconName: 'group',
          route: '/products/all'
        }
      ]
    },
    {
      displayName: 'Blog',
      iconName: 'report_problem',
      route: '/blog-list'
    },
    {
      displayName: 'FAQ',
      iconName: 'speaker_notes',
      route: '/faq'
    },
    {
      displayName: 'Aount Us',
      iconName: 'group',
      route: '/about'
    },
    {
      displayName: 'Contact',
      iconName: 'feedback',
      route: '/contact'
    } 
  ],    
};