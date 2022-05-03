import { Component, OnInit, Input } from '@angular/core';
import { Bundle } from 'src/app/_classes/bundle.class';

@Component({
  selector: 'app-bundle-detail',
  templateUrl: './bundle-detail.component.html',
  styleUrls: ['./bundle-detail.component.scss'],
})
export class BundleDetailComponent implements OnInit {
  @Input('bundle') bundle:Bundle;

  constructor() { }

  ngOnInit() {
    
  }

}
