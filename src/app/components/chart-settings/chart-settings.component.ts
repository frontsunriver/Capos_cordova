import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-chart-settings',
  templateUrl: './chart-settings.component.html',
  styleUrls: ['./chart-settings.component.scss'],
})
export class ChartSettingsComponent implements OnInit {

  intervals = [
    {label: 'Daily', value:'daily'},
    {label: 'Monthly', value:'monthly'},
    {label: 'Yearly', value:'yearly'}
  ];

  interval: string = 'daily';
  date_from: string = '';
  date_to: string = '';

  constructor(
    private popoverController: PopoverController
  ) {

  }

  ngOnInit() {}

  apply() {
    let result = {
      interval: this.interval,
      date_from: this.date_from,
      date_to: this.date_to
    }
    this.popoverController.dismiss(result);
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
