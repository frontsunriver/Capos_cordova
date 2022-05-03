import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { PopoverController } from '@ionic/angular';
import { TableColumnsComponent } from '../table-columns/table-columns.component';
import * as UtilFunc from 'src/app/_helpers/util.helper';

export interface IPage{
  totalElements: number,
  pageNumber: number
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements OnInit {
  @ViewChild('myTable') table: any;

  @Input('tb_name') tb_name:string;  
  @Input('rows') rows:any[];
  @Input('all_columns') all_columns:any[];  
  @Input('show_columns') show_columns:any[];
  @Input('show_details') show_details:boolean;
  @Input('show_search') show_search:boolean;
  @Input('add_new') add_new:boolean;
  @Input('add_new_button') add_new_button:string = 'Add New';
  @Input('loading') loading:boolean;
  @Input('external_sort') external_sort:boolean;
  @Input('external_page') external_page:boolean;
  @Input('page') page:IPage = {totalElements: 0, pageNumber: 0};
  @Input('summary') summary:any[];
  @Input('limit') limit: number;
  @Output() reloadEvent = new EventEmitter();
  @Output() deleteRowEvent = new EventEmitter();
  @Output() addRowEvent = new EventEmitter();
  @Output() editRowEvent = new EventEmitter();
  @Output() searchEvent = new EventEmitter();
  @Output() sortEvent = new EventEmitter();
  @Output() pageEvent = new EventEmitter();

  ColumnMode = ColumnMode;   
  SelectionType = SelectionType;
  show_column:number; 
  expand:string = 'down';
  timeout:any;

  linked_products = ['product_attribute', 'product_tag', 'product_brand', 'product_supplier', 'product_type'];

  constructor(
    private popoverController: PopoverController,
    private platform: Platform
  ) {    
  }  

  ngOnInit() {
    this.platform.ready().then(() => {
      let width = this.platform.width();      
      this.show_column = UtilFunc.getShowColumns(this.show_columns, width);      
    })    
  }

  public get availableTable():boolean {
    return typeof this.rows != 'undefined';
  }

  public get columns():any[] {
    let result = [];
    let clms = this.all_columns.filter(item => item.checked);
    for(let i=0;i<clms.length;i++) {
      if(i>=this.show_column) break;
      result.push(clms[i]);
    }
    return result;
  }

  public get hidden_columns():any[] {
    let result = [];
    let clms = this.all_columns.filter(item => item.checked);
    for(let i=this.show_column;i<clms.length;i++) {      
      result.push(clms[i]);
    }
    return result;
  }

  onPage(pageInfo) {
    this.expand = 'down';
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      document.querySelector('.ngx-table-wrapper').scroll({ 
        top: 0, 
        left: 0, 
        behavior: 'smooth' 
      }); 
    }, 100);
    if(this.external_page && this.pageEvent) {
      this.pageEvent.emit(pageInfo.offset);
    }
  }

  onDetailToggle(ev: any) {

  }

  toggleExpandRow(row) {    
    this.table.rowDetail.toggleExpandRow(row);
  }

  async openColumns(ev: any) {    
    const popover = await this.popoverController.create({
      component: TableColumnsComponent,
      event: ev,
      //cssClass: 'popover_custom',      
      translucent: true,
      componentProps: {all_columns: this.all_columns}
    });

    await popover.present();  
  }

  onReloadTable() {    
    this.reloadEvent.emit();    
  }

  onTableContextMenu(contextMenuEvent) {

    if (contextMenuEvent.type === 'body') {
      let row = contextMenuEvent.content;
      this.deleteRowEvent.emit(row);
    } 
    contextMenuEvent.event.preventDefault();
    contextMenuEvent.event.stopPropagation();
  }

  addNew() {
    this.addRowEvent.emit();
  }

  editRow(event) {    
    if(event.type == 'click') {
      this.editRowEvent.emit(event.row);
    }
  }

  toggleExpand(event:any) {
    if(this.expand == 'down') {
      this.table.rowDetail.expandAllRows();
      this.expand = 'up';
    } else {
      this.table.rowDetail.collapseAllRows();
      this.expand = 'down';
    }
  }

  openSearch() {
    this.searchEvent.emit();
  }

  onSort(event) {
    const sort = event.sorts[0];
    if(this.external_sort && this.sortEvent) {
      this.sortEvent.emit(sort);  
    } else {
      this.loading = true;        
      setTimeout(() => {        
        const rows = [...this.rows];        
        rows.sort((a, b)=> {
          if(typeof a[sort.prop] == 'string') {
            return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
          } else {            
            return (a[sort.prop] - b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
          }
        })
        this.rows = rows;
        this.loading = false;
      }, 200);
    }
    this.expand = 'down';
  }

}
