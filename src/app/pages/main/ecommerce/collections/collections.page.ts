import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Collection } from 'src/app/_classes/collection.class';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CollectionService } from 'src/app/_services/collection.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {
  title:string = 'Collections';
  breadcrumb:any[] = [];
  _id: string = '';
  all_collections:Collection[] = [];
  table_data:Collection[] = [];

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private nav: NavController
  ) {
    
  }  

  ngOnInit() {    
    this.init();
  }

  init() {
    this.utilService.get('product/collection', {}).subscribe(result => {
      if(result && result.body) {
        for(let c of result.body) {
          let collection = new Collection(this.authService, this.utilService);
          collection.loadDetails(c);
          this.all_collections.push(collection);
        }
      }
      this.initTable();  
    })        
  }

  public get parent():Collection {
    return this.collectionService.view_parent;
  }

  ionViewDidEnter() {
    if(this.collectionService.changed) {
      this.init();
      this.collectionService.changed = false;
    }
  }

  setBreadcrumb() { 
    let root = new Collection(this.authService, this.utilService);
    root.name = 'Root';
    this.breadcrumb = [root];
    if(this.parent && this.parent._id) {
      let pp:Collection[] = this.getAllParentCollections(this.parent._id);
      for(let i=pp.length-1;i>=0;i--) {
        this.breadcrumb.push(pp[i]);
      }
    }
  }

  getAllParentCollections(_id:string):Collection[] {    
    let self:Collection = this.getCollectionById(_id);    
    if(self && self.parent) {
      return [self].concat(this.getAllParentCollections(self.parent._id));
    } else {
      return [self];
    }
  }

  getCollectionById(_id:string):Collection {
    let index = this.all_collections.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.all_collections[index];
    }
    return null;
  }

  gotoParent(collection: Collection) {    
    this.collectionService.view_parent = collection;
    this.initTable();    
  }

  initTable() {
    this.setBreadcrumb();
    const query = {parent: ''};
    if(this.parent) {
      query.parent = this.parent._id;
    }
    this.table_data = [];
    this.utilService.get('product/collection', query).subscribe(result => {
      if(result && result.body) {
        for(let c of result.body) {          
          let collection = new Collection(this.authService, this.utilService);
          collection.loadDetails(c);
          this.table_data.push(collection);
        }
      }      
    })
  }

  addNew() {    
    this.collectionService.parent = this.getCollectionById(this.parent._id);
    this.collectionService.init();
    this.nav.navigateForward(['edit-collection']);
  }

  handleAction(action:string, collection:Collection) {    
    if(action == 'view') {
      if(collection.children.length == 0) return;
      this.gotoParent(collection);
    }
    if(action == 'edit') {      
      this.collectionService.parent = this.getCollectionById(this.parent._id);
      this.collectionService.init(collection._id, () => {
        this.nav.navigateForward(['edit-collection']);
      })
    }
    if(action == 'delete') {
      this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this collection?', () => {
        collection.delete(() => {
          this.initTable();
        })
      })      
    }
  }
}
