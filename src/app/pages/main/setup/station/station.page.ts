import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/_configs/constants';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Device } from '@ionic-native/device/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/_services/auth.service';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {
  title = 'Station Management';
  cur_tab: string = 'general';
  public columns: any;
  public rows: any;
  selectStationID: string;
  selected = [];
  pageData: any[];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  printers: any[] = [];
  receipterPrinter1Status: boolean = false;
  receipterPrinter1: string = "";
  receipterPrinter2Status: boolean = false;
  receipterPrinter2: string = "";
  windowsFontUsed: boolean = false;
  font: string = "";
  width: number;
  cashDrawerStatus: boolean = false;
  cashDrawer: string = "";
  lowVoltageUsed: boolean = false;
  barcodeReaderStatus: boolean = false;
  barcodeReader: string = "";
  reportPrinterStatus: boolean = false;
  reportPrinter: string = "";
  barcodeWriterStatus: boolean = false;
  barcodeWriter: string = "";
  mediaType: string = "";
  scaleStatus: boolean = false;
  scale: string = "";
  form: FormGroup;
  deviceUUID: string = "";
  deviceModel: string = "";
  private_web_address: string = "";

  submitDisabled = true;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private utilService: UtilService,
    private device: Device,
    private platform: Platform,
    private authService: AuthService,
    private print: PrintService,
    public jwtHelper: JwtHelperService,
    public alertController: AlertController
  ) {
    this.columns = [
      { name: 'Station #' },
      { name: 'Name' },
      { name: 'Store #' }
    ];

    const tkn = this.authService.getToken();
    const decoded = this.jwtHelper.decodeToken(tkn);
    this.private_web_address = decoded.private_web_address;

    this.platform.ready().then(() => {
      this.deviceUUID = this.device.uuid;
      this.deviceModel = this.device.model;
      // Get printer list.
      this.addPrinterList();
    })
  }

  ngOnInit(): void {
    this.initForm()
    this.initTable()
  }

  async confirmAlert(type: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm',
      subHeader: '',
      message: type === "add" ? 'Are you sure to add new one station?' : 'Are you sure to delete this station?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            if (type === "delete") {
              this.deleteStation();
            } else if (type === "add") {
              this.onAddStation()
            }
          }
        }
      ]
    });

    await alert.present();
  }

  initTable(): void {
    this.utilService.get('station/station', {}).subscribe(result => {

      if (result && result.body) {
        const tmp = []
        result.body.map((station: any) => {
          this.pageData = result.body
          if (this.deviceUUID === station.deviceInfo) {
            tmp.push({
              id: station._id,
              station: station.stationID,
              name: station.name,
              store: station.private_web_address
            })
          }

        })
        this.rows = tmp;
      } else {
        this.rows = [];
        this.pageData = [];
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      stationID: ['', Validators.required],
      stationName: ['', Validators.required],
      storeID: ['', Validators.required],
    });
  }

  onSelect({ selected }) {
    this.selected = selected
    this.onStationRowSelect(selected[0].id)
  }

  addPrinterList(): void {
    // const temp = this.printers;

    //  This is a old code.
    // if (item) {

    //   if (temp.length > 0) {
    //     const exist = temp.includes(item)
    //     if (!exist) {
    //       temp.push(item);
    //     }
    //   } else {
    //     temp.push(item);
    //   }
    // }

    // This is a new code.
    this.print.searchBluetoothPrinter()
      .then(resp => {

        //List of bluetooth device list
        this.printers = resp;
      });
  }

  async onStationRowSelect(id: string): Promise<void> {
    this.selectStationID = id;
    this.utilService.get('station/station', { _id: id }).subscribe(result => {
      if (result && result.body) {
        console.log(result.body)
        this.form = this.fb.group({
          stationID: [result.body.stationID, Validators.required],
          stationName: [result.body.name, Validators.required],
          storeID: [result.body.private_web_address, Validators.required],
        });
        this.receipterPrinter1 = result.body.receipterPrinter1 || "";
        this.receipterPrinter1Status = Boolean(result.body.receipterPrinter1)

        this.receipterPrinter2 = result.body.receipterPrinter2 || "";
        this.receipterPrinter2Status = Boolean(result.body.receipterPrinter2)

        this.font = result.body.font || "";
        this.windowsFontUsed = Boolean(result.body.font)

        this.width = result.body.width || null;

        this.cashDrawer = result.body.cashDrawer || "";
        this.cashDrawerStatus = Boolean(result.body.cashDrawer)

        this.lowVoltageUsed = result.body.lowVoltageUsed;

        this.barcodeReader = result.body.barcodeReader;
        this.barcodeReaderStatus = Boolean(result.body.barcodeReader);

        this.reportPrinter = result.body.reportPrinter || "";
        this.reportPrinterStatus = Boolean(result.body.reportPrinter)

        this.barcodeWriter = result.body.barcodeWriter;
        this.mediaType = result.body.mediaType;
        this.barcodeWriterStatus = Boolean(result.body.barcodeWriter)

        this.scale = result.body.scale || "";
        this.scaleStatus = Boolean(result.body.scale)

        if (this.deviceUUID === result.body.deviceInfo) {
          this.submitDisabled = false;
        } else {
          this.submitDisabled = true;
        }
      }
    })
  }

  onAddStation(): void {

    const data = {
      private_web_address: this.private_web_address,
      deviceType: this.deviceModel,
      deviceInfo: this.deviceUUID
    }

    this.utilService.post('station/station', data).subscribe((res) => {
      if (res) {
        this.toastService.show('Station create successfully');
        this.initTable();
      }
    });

  }

  submit(): void {
    if (this.form.invalid) {
      this.toastService.show('Please, fill the required fields!');
      return;
    }

    if (!this.selectStationID) {
      this.toastService.show('Please, select one station!');
      return;
    }

    const data = {
      _id: this.selectStationID,
      stationID: this.form.get('stationID').value,
      name: this.form.get('stationName').value,
      private_web_address: this.form.get('storeID').value,
      receipterPrinter1: this.receipterPrinter1,
      receipterPrinter2: this.receipterPrinter2,
      cashDrawer: this.cashDrawer,
      lowVoltageUsed: this.lowVoltageUsed,
      barcodeReader: this.barcodeReader,
      font: this.font,
      width: this.width,
      reportPrinter: this.reportPrinter,
      barcodeWriter: this.barcodeWriter,
      mediaType: this.mediaType,
      scale: this.scale
    }
    this.utilService.put('station/station', data).subscribe((res) => {
      if (res && res.body) {
        if (res.body.status === "already_exist") {
          this.toastService.show('Station already exist');
        } else {
          this.toastService.show('Station update successfully');
          this.initTable();
        }

      }
    });
  }

  deleteStation(): void {
    if (!this.selectStationID) {
      this.toastService.show('Please, select one station!');
      return;
    }

    this.utilService.delete('station/station?_id=' + this.selectStationID).subscribe(result => {
      if (result) {
        this.toastService.show('Station delete successful!');
        this.initTable();
        this.initForm();
        this.receipterPrinter1 = "";
        this.receipterPrinter1Status = false;

        this.receipterPrinter2 = "";
        this.receipterPrinter2Status = false;

        this.font = "";
        this.windowsFontUsed = false;

        this.width = null;

        this.cashDrawer = "";
        this.cashDrawerStatus = false;

        this.lowVoltageUsed = false;

        this.barcodeReader = "";
        this.barcodeReaderStatus = false;

        this.reportPrinter = "";
        this.reportPrinterStatus = false;

        this.barcodeWriter = "";
        this.mediaType = "";
        this.barcodeWriterStatus = false;

        this.scale = "";
        this.scaleStatus = false;

        this.selectStationID = "";
        this.submitDisabled = true;
      }
    })
  }

  get stationIDInput(): any { return this.form.get('stationID'); }

  get stationNameInput(): any { return this.form.get('stationName'); }

  get storeIDInput(): any { return this.form.get('storeID'); }

}
