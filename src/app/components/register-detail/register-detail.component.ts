import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { Openclose } from 'src/app/_classes/openclose.class';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { CashDetailComponent } from '../cash-detail/cash-detail.component';
import { PrintService } from 'src/app/services/print.service';
import EscPosEncoder from 'esc-pos-encoder-ionic';
import html2canvas from 'html2canvas';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';

@Component({
  selector: 'app-register-detail',
  templateUrl: './register-detail.component.html',
  styleUrls: ['./register-detail.component.scss'],
})
export class RegisterDetailComponent implements OnInit {
  openClose: Openclose = null;
  util = UtilFunc;

  printers: any[] = [];
  printImage: string;

  constructor(
    private nav: NavController,
    private authService: AuthService,
    private utilService: UtilService,
    private toastService: ToastService,
    private activateRoute: ActivatedRoute,
    private popoverController: PopoverController,
    private print: PrintService,
    public printer: Printer
  ) {

    this.addPrinterList();
  }

  ngOnInit() {
    this.activateRoute.queryParams.subscribe(query => {
      if (query && query._id) {
        this.openClose = new Openclose(this.authService, this.utilService);
        this.openClose.loadById(query._id, (result) => {

        }, () => {
          this.toastService.show('No Existing Register');
          this.nav.back();
        })
      } else {
        this.nav.back();
      }
    });
  }

  addPrinterList(): void {

    this.print.searchBluetoothPrinter()
      .then(resp => {

        //List of bluetooth device list
        this.printers = resp;
      });
  }

  checkNumberMultiple(x, y): number {
    const remainder = x % y;
    if (remainder == 0) {
      return x;
    } else {
      return x - remainder;
    }
  }

  _base64ToArrayBuffer(base64): any {
    var binary_string = base64;
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async printSummary() {
    const printMac = this.printers[0]?.id;

    this.printer.isAvailable().then((onSuccess: any) => {
      const node = document.getElementById("report-print-summary").innerHTML;

      let options: PrintOptions = {
        name: 'Receipt',
        duplex: true,
        orientation: "portrait",
        monochrome: true
      };
      this.printer.print(node, options).then((value: any) => {
        console.log('value:', value);
      }, (error) => {
        console.log('eror:', error);
      });
    }, (err) => {
      console.log('err:', err);
    });

    // const encoded = window.btoa(node);
    // const dataUrl = await domtoimage.toPng(node) || "test data url";
    // const img = new Image();
    // // const base64Response = await fetch(imgSrc);
    // // const blob = await base64Response.blob();
    // // const buffer = this._base64ToArrayBuffer(imgSrc);
    // // this.print.sendToBluetoothPrinter(printMac, buffer);
    // console.log(node)
    // const canvas = await html2canvas(node);
    // let imgSrc = canvas.toDataURL("image/png");
    // this.printImage = imgSrc;
    // img.src = imgSrc;

    // img.onload = async () => {
    //   const imgWidth = this.checkNumberMultiple(img.naturalWidth, 8);
    //   const height = this.checkNumberMultiple(img.naturalHeight, 8);
    //   const encoder = new EscPosEncoder();
    //   const printData = (encoder.initialize().image(img, imgWidth - 32, height).newline().encode()).buffer;
    //   console.log(printData)
    //   await this.print.sendToBluetoothPrinter(printMac, printData);
    // }

    // this.print.disconnectBluetoothPrinter()
    // const myText = "Hello hello hello \n\n\n This is a test \n\n\n";
    // this.print.sendToBluetoothPrinter(this.printers[0].id, myText);
  }

  async openCashDetail(openClose: Openclose) {
    const popover = await this.popoverController.create({
      component: CashDetailComponent,
      // event: ev,
      cssClass: 'popover_custom',
      translucent: true,
      componentProps: { openClose: openClose }
    });

    await popover.present();
  }
}
