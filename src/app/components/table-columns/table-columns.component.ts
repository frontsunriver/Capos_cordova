import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-columns',
  templateUrl: './table-columns.component.html',
  styleUrls: ['./table-columns.component.scss'],
})
export class TableColumnsComponent implements OnInit {
  
  all_columns: any[];
  all_check: boolean = true;

  constructor() { }

  ngOnInit() {}

  onAllCheck() {
    for(let c of this.all_columns) {
      c.checked = this.all_check;
    }
  }

  updateAllCheck() {
    if(this.all_columns.filter(c => c.checked).length == 0) {
      this.all_check = false;
    } else if(this.all_columns.every(c => c.checked)) {
        this.all_check = true;
    }
  }

  someCheck(): boolean {    
    let c = this.all_columns.filter(c => c.checked);    
    if (c.length == 0) {
      return false;
    }
    return this.all_columns.length != c.length;
  }

  reorderColumns(ev) {
    const itemMove = this.all_columns.splice(ev.detail.from, 1)[0];
    this.all_columns.splice(ev.detail.to, 0, itemMove);
    ev.detail.complete();
  }

}
