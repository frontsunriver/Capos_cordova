import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-search-product',
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.scss'],
})
export class SearchProductComponent implements OnInit {
  
  form: FormGroup;
  user: any;
  types = [];
  tags = [];
  suppliers = [];
  brands = [];
  attributes = [];
  filter: any;

  constructor(
    private utilService: UtilService,
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      keyword: [''],
      type: [''],
      tag: [''],
      supplier: [''],
      brand: [''],
      attribute: [''],
      enabled: ['']
    })
    this.utilService.get('product/type', {}).subscribe(result => {
      this.types = result.body;
    });
    
    this.utilService.get('product/tag', {}).subscribe(result => {
      this.tags = result.body;
    });

    this.utilService.get('product/supplier', {}).subscribe(result => {
      this.suppliers = result.body;
    });

    this.utilService.get('product/brand', {}).subscribe(result => {
      this.brands = result.body;
    });

    this.utilService.get('product/attribute', {}).subscribe(result => {
      this.attributes = result.body;
    });
  }

  ngOnInit() {        
  }

  ionViewDidEnter() {
    if(this.filter) {
      Object.keys(this.form.value).forEach(key => {
        this.form.get(key).setValue(this.filter[key]);
      })
    }
  }

  search() {    
    this.popoverController.dismiss({
      process: true, filter: this.form.value
    });
  }

  clearFilter() {
    for(let key in this.form.value) {
      this.form.get(key).setValue('');
    }    
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
