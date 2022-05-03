import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-search-keyword',
  templateUrl: './search-keyword.component.html',
  styleUrls: ['./search-keyword.component.scss'],
})
export class SearchKeywordComponent implements OnInit {
  title:string = '';
  keyword:string = '';
  label:string = '';
  form: FormGroup;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      keyword: ['']
    });
  }

  ngOnInit() {
    this.title = 'Search ' + this.title;
    if(this.keyword) {      
      this.form.get('keyword').setValue(this.keyword);
    }
  }

  search() {    
    this.popoverController.dismiss({
      process: true, filter: this.form.value
    });
  }

  clearFilter() {
    this.form.setValue({
      keyword: ''
    });
    this.search();
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
