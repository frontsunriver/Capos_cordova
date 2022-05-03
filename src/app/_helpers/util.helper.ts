import { CameraOptions, DestinationType, EncodingType, MediaType, PictureSourceType } from "@ionic-native/Camera/ngx";
import { APP_CONSTANTS } from "../_configs/constants";

export const genRandomOrderString = (length) => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const formatNumber = (str?:number, decimal:number = 2)=>{
  if(typeof str == 'undefined') str = 0;
  return str.toFixed(decimal);
};

export const toUppercase = (str) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1, str.length);
};

export const getSlug = (str:string):string => {
  return str.toLowerCase().replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
}

export const scrollToTop = () => {
  if(document.querySelector('.mat-sidenav-content')){
    document.querySelector('.mat-sidenav-content').scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });   		
  }
}

export const getShowColumns = (show_columns:any[], width:number) => {  
  if(width <= 440) {
    return getMaxArrayValue(show_columns, 0);
  } else if(width <= 576) {
    return getMaxArrayValue(show_columns, 1);
  } else if(width <= 768) {
    return getMaxArrayValue(show_columns, 2);
  } else if(width <= 992) {
    return getMaxArrayValue(show_columns, 3);
  } else {
    return getMaxArrayValue(show_columns, 4);
  }
}
const getMaxArrayValue = (arr:any[], index:number) => {
  if(index<=arr.length) {
    return arr[index];
  } else {
    return arr[length-1];
  }
}

const splitDate = (str) => {
  let date = new Date(str),
      year = date.getFullYear(),
      month = date.getMonth() + 1, m = ('0' + month.toString()).substr(-2),
      dt = date.getDate(), d = ('0' + dt.toString()).substr(-2),
      hour = date.getHours(), h = ('0' + hour.toString()).substr(-2),
      minute = date.getMinutes(), mit = ('0' + minute.toString()).substr(-2),
      second = date.getSeconds(), sec = ('0' + second.toString()).substr(-2);
  return {date: [year, m, d], time: [h, mit, sec]};
}

export const handleDate = (str) => {
  let datetime = splitDate(str);
  return datetime.date.join('-');
};

export const handleDateTime = (str) => {
  let datetime = splitDate(str);
  return datetime.date.join('-') + ' ' + datetime.time.join(':');
};

export const handleTime = (str) => {
  let datetime = splitDate(str);
  return datetime.time.join(':');
};

export const abs = (num) => {
  return Math.abs(num);
};

export const round = (num: string) => {
  return num ? parseFloat(num).toFixed(2) : '0.00';
};

export const getTime = (date:string):number => {
  let d = new Date(date);
  return d.getTime();
}

export const diffHours = (date1, date2) => {
  let d1 = new Date(date1);
  let d2 = new Date(date2); 
  
  // To calculate the time difference of two dates
  let Difference_In_Seconds = (d2.getTime() - d1.getTime()) / 1000;
  let Difference_In_Minutes = Math.floor(Difference_In_Seconds / 60); 
  let sec = Math.floor(Difference_In_Seconds - Difference_In_Minutes * 60);
  let hour = Math.floor(Difference_In_Minutes / 60);
  let min = Difference_In_Minutes - hour * 60;  
  return hour + 'h ' + min + 'm ' + sec + 's';
}

export const compareDate = (d1:string, d2:string) => {    
  if(!d1 && !d2) {
    return 0;
  } else if(!d1 && d2) {
    return -1;
  } else if(d1 && !d2) {
    return 1;
  } else {
    let date1 = new Date(d1), date2 = new Date(d2);
    if(date1.getTime() == date2.getTime()) {
      return 0;
    } else if(date1.getTime() > date2.getTime()) {
      return 1;
    } else {
      return -1;
    }
  }
}

export const getAge = (birthday) => {
  let d1 = new Date(birthday);
  let d2 = new Date();
  if(d1) {
    return d2.getFullYear() - d1.getFullYear();
  }
  return 0;
}

export const getCameraPictureOption = (sourceType: PictureSourceType) => {
  var options: CameraOptions = {
    quality: 100,
    sourceType: sourceType,
    destinationType: DestinationType.DATA_URL, //FILE_URL
    encodingType: EncodingType.PNG,
    mediaType: MediaType.PICTURE,
    saveToPhotoAlbum: false,
    correctOrientation: true,
    allowEdit : true
  };
  return options;
}

export const b64toBlob = (b64Data:any, contentType?:string, sliceSize?:number) => {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

export const getPriceWithCurrency = (price:any)=> {
  price = Number(price);
  if(price>=0) {
    return '$' + price.toFixed(2);
  } else {
    return '-$' + Math.abs(price).toFixed(2);
  }
}

export const getRouterLink = (link:string='home', param?:string) => {
  let url = '/', result = [url];  
  if(APP_CONSTANTS.IS_FRONT) {
    url += link;
    result = [url];  
  } else {
    let online_store = 'online-store', 
      private_web_address = getPrivateWebAddress();
    if(private_web_address == '') {
      if(link == 'home') {
        url += 'home';
      } else {
        url += 'error';
      }
    } else {
      url = '/' + online_store + '/' + private_web_address + '/' + link;
      result = [url];
    }
  }
  if(param) result.push(param);
  return result;
}

export const getPrivateWebAddress = () => {
  let private_web_address = '';
  if(!APP_CONSTANTS.IS_FRONT) {
    let online_store = 'online-store';
    let url = window.location.href, tmp = url.split('/');
    for(let i=0;i<tmp.length;i++) {
      if(tmp[i] == online_store && i+1<tmp.length) {
        private_web_address = tmp[i+1];
      }
    }  
  }
  return private_web_address;
}

export const getDomain = () => {
  let href = window.location.href, 
      url = new URL(href);
  return url.hostname;
}

export const stripHtml = (html) => {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export const ADDRESS = {
  street: [''],
  city: [''],
  suburb: [''],
  postcode: [''],
  state: [''],
  country: ['']
};

export const rolePermissionGroups = [
  {
    "uid": "product_costs",
    "label": "Product Costs"
  },
  {
    "uid": "labels",
    "label": "Labels"
  },
  {
    "uid": "discounts",
    "label": "Discounts"
  },
  {
    "uid": "sell",
    "label": "Sell"
  },
  {
    "uid": "customers",
    "label": "Customers"
  },
  {
    "uid": "products",
    "label": "Products"
  },
  {
    "uid": "reporting",
    "label": "Reporting"
  },
  {
    "uid": "ecommerce",
    "label": "Ecommerce"
  },
  {
    "uid": "setup",
    "label": "Setup"
  }
];