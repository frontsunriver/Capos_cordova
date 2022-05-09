import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Cart } from 'src/app/_classes/cart.class';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { Constants } from 'src/app/_configs/constants';
import { AlertService } from 'src/app/_services/alert.service';
import { PrintService } from 'src/app/services/print.service';
import EscPosEncoder from 'esc-pos-encoder-ionic';
import html2canvas from 'html2canvas';
import { decode, encode } from 'base64-arraybuffer';


const commands = {
  LF: '\x0a',
  ESC: '\x1b',
  FS: '\x1c',
  GS: '\x1d',
  US: '\x1f',
  FF: '\x0c',
  DLE: '\x10',
  DC1: '\x11',
  DC4: '\x14',
  EOT: '\x04',
  NUL: '\x00',
  EOL: '\n',
  HORIZONTAL_LINE: {
    HR_58MM: '================================',
    HR2_58MM: '********************************'
  },
  FEED_CONTROL_SEQUENCES: {
    CTL_LF: '\x0a', // Print and line feed
    CTL_FF: '\x0c', // Form feed
    CTL_CR: '\x0d', // Carriage return
    CTL_HT: '\x09', // Horizontal tab
    CTL_VT: '\x0b', // Vertical tab
  },
  LINE_SPACING: {
    LS_DEFAULT: '\x1b\x32',
    LS_SET: '\x1b\x33'
  },
  HARDWARE: {
    HW_INIT: '\x1b\x40', // Clear data in buffer and reset modes
    HW_SELECT: '\x1b\x3d\x01', // Printer select
    HW_RESET: '\x1b\x3f\x0a\x00', // Reset printer hardware
  },
  CASH_DRAWER: {
    CD_KICK_2: '\x1b\x70\x00', // Sends a pulse to pin 2 []
    CD_KICK_5: '\x1b\x70\x01', // Sends a pulse to pin 5 []
  },
  MARGINS: {
    BOTTOM: '\x1b\x4f', // Fix bottom size
    LEFT: '\x1b\x6c', // Fix left size
    RIGHT: '\x1b\x51', // Fix right size
  },
  PAPER: {
    PAPER_FULL_CUT: '\x1d\x56\x00', // Full cut paper
    PAPER_PART_CUT: '\x1d\x56\x01', // Partial cut paper
    PAPER_CUT_A: '\x1d\x56\x41', // Partial cut paper
    PAPER_CUT_B: '\x1d\x56\x42', // Partial cut paper
  },
  TEXT_FORMAT: {
    TXT_NORMAL: '\x1b\x21\x00', // Normal text
    TXT_2HEIGHT: '\x1b\x21\x10', // Double height text
    TXT_2WIDTH: '\x1b\x21\x20', // Double width text
    TXT_4SQUARE: '\x1b\x21\x30', // Double width & height text
    TXT_CUSTOM_SIZE: function (width, height) { // other sizes
      var widthDec = (width - 1) * 16;
      var heightDec = height - 1;
      var sizeDec = widthDec + heightDec;
      return '\x1d\x21' + String.fromCharCode(sizeDec);
    },

    TXT_HEIGHT: {
      1: '\x00',
      2: '\x01',
      3: '\x02',
      4: '\x03',
      5: '\x04',
      6: '\x05',
      7: '\x06',
      8: '\x07'
    },
    TXT_WIDTH: {
      1: '\x00',
      2: '\x10',
      3: '\x20',
      4: '\x30',
      5: '\x40',
      6: '\x50',
      7: '\x60',
      8: '\x70'
    },

    TXT_UNDERL_OFF: '\x1b\x2d\x00', // Underline font OFF
    TXT_UNDERL_ON: '\x1b\x2d\x01', // Underline font 1-dot ON
    TXT_UNDERL2_ON: '\x1b\x2d\x02', // Underline font 2-dot ON
    TXT_BOLD_OFF: '\x1b\x45\x00', // Bold font OFF
    TXT_BOLD_ON: '\x1b\x45\x01', // Bold font ON
    TXT_ITALIC_OFF: '\x1b\x35', // Italic font ON
    TXT_ITALIC_ON: '\x1b\x34', // Italic font ON
    TXT_FONT_A: '\x1b\x4d\x00', // Font type A
    TXT_FONT_B: '\x1b\x4d\x01', // Font type B
    TXT_FONT_C: '\x1b\x4d\x02', // Font type C
    TXT_ALIGN_LT: '\x1b\x61\x00', // Left justification
    TXT_ALIGN_CT: '\x1b\x61\x01', // Centering
    TXT_ALIGN_RT: '\x1b\x61\x02', // Right justification
  }
}

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss'],
})
export class SaleDetailComponent implements OnInit {
  cart: Cart;
  util = UtilFunc;
  completed_status = Constants.completed_status;
  continue_status = Constants.continue_status;
  unfulfilled_status = Constants.unfulfilled_status;

  printers: any[] = [];

  constructor(
    private popoverController: PopoverController,
    private alertService: AlertService,
    private print: PrintService,

  ) {
    this.addPrinterList();
  }

  ngOnInit() { }

  dismiss() {
    this.popoverController.dismiss();
  }

  addPrinterList(): void {

    this.print.searchBluetoothPrinter()
      .then(resp => {

        //List of bluetooth device list
        this.printers = resp;
      });
  }

  getTooltip(sale: Cart) {
    if (this.continue_status.includes(sale.sale_status)) {
      return 'Continue Sale';
    }
    if (this.completed_status.includes(sale.sale_status)) {
      return 'Return Items';
    }
    if (this.unfulfilled_status.includes(sale.sale_status)) {
      return 'Mark as Complete';
    }
    return '';
  }

  handleAction(sale: Cart) {
    let action = 'new';
    if (this.completed_status.includes(sale.sale_status)) {
      action = 'return';
    }
    if (this.unfulfilled_status.includes(sale.sale_status)) {
      action = 'mark';
    }
    this.popoverController.dismiss({ action: action, sale: sale });
  }

  viewOriginalSale(sale_number: string) {
    if (sale_number) {
      this.popoverController.dismiss({ action: 'view_origin', sale_number: sale_number });
    }
  }

  voidSale(sale: Cart) {
    let title = 'You are about to void this sale.';
    let msg = 'This will return the products back into your inventory and remove any payments that were recorded. You’ll still be able to see the details of this sale once it has been voided. This can’t be undone.';
    this.alertService.presentAlertConfirm(title, msg, () => {
      this.popoverController.dismiss({ action: 'void_sale', sale: sale });
    }, null, 'Void Sale', 'Don\'t Void');
  }

  voidItems(sale: Cart) {
    this.popoverController.dismiss({ action: 'void', sale: sale });
  }

  checkNumberMultiple(x, y): number {
    const remainder = x % y;
    if (remainder == 0) {
      return x;
    } else {
      return x - remainder;
    }
  }

  convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(';base64,') + ';base64,'.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  async printSale() {
    const printMac = this.printers[0]?.id;
    const node = await document.getElementById("sale-detail-print");
    console.log(this.cart)

    const date = new Date(Date.now())
    const dateNow = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    let receipt = "";
    receipt += commands.HARDWARE.HW_INIT;
    receipt += commands.TEXT_FORMAT.TXT_4SQUARE;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += this.cart.store_info.store_name;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += this.cart.store_info.physical_address.country.country_name + " " + this.cart.store_info.physical_address.city + " " + this.cart.store_info.physical_address.street;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += this.cart.store_info.phone;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += "Receipt ";
    receipt += this.cart.sale_number;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += commands.EOL;
    receipt += dateNow;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.HORIZONTAL_LINE.HR_58MM;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    this.cart.products.forEach((p) => {
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_NORMAL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += p.product_name;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += `${p.qty}     `;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += p.discountedTotalWithoutGlobal_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += "Subtotal     ";
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += this.cart.subTotal_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += `Discount${this.cart.discount_rate}     `;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += this.cart.discount_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += `Total Tax${this.cart.taxRate_str}     `;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += this.cart.taxAmount_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += "Sale Total     ";
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += this.cart.totalIncl_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += "Voided     ";
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += this.cart.voidedAmount_str;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += "Change     ";
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += UtilFunc.getPriceWithCurrency(this.cart.change);
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += "Balance     ";
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
      receipt += UtilFunc.getPriceWithCurrency(this.cart.total_to_pay);

    })
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += commands.HORIZONTAL_LINE.HR2_58MM;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;

    console.log(receipt)
    this.print.sendToBluetoothPrinter(printMac, receipt);

  }
}
