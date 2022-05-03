import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AutoCompleteComponent, AutoCompleteOptions } from 'ionic4-auto-complete';
import { Collection } from 'src/app/_classes/collection.class';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { CollectionService } from 'src/app/_services/collection.service';
import { SearchProductService } from 'src/app/_services/search-product.service';
import { UtilService } from 'src/app/_services/util.service';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { AlertService } from 'src/app/_services/alert.service';
import { ToastService } from 'src/app/_services/toast.service';
import { LoadingService } from 'src/app/_services/loading.service';

interface ICollectionWithLevel{
  _id: string,
  name: string,
  parents: Collection[]
}

@Component({
  selector: 'app-edit-collection',
  templateUrl: './edit-collection.component.html',
  styleUrls: ['./edit-collection.component.scss'],
})
export class EditCollectionComponent implements OnInit {
  title:string = 'Add New Collection';
  util = UtilFunc;
  form: FormGroup;  
  parents:ICollectionWithLevel[] = [];
  all_collections:Collection[] = [];
  all_sub_collections:Collection[] = [];
  parent:Collection;
  parent_id: string;
  collections_with_level:ICollectionWithLevel[] = [];  
  keyword: string = '';
  optionAutoComplete: AutoCompleteOptions;
  isSubmitted: boolean = false;
  @ViewChild('searchbar') searchbar: AutoCompleteComponent; 

  constructor(
    private nav: NavController,
    private collectionService: CollectionService,
    private authService: AuthService,
    private utilService: UtilService,
    private alertService: AlertService,
    private toastService: ToastService,
    private loading: LoadingService,
    private fb: FormBuilder,
    public providerProduct: SearchProductService,
  ) {    
    this.optionAutoComplete = new AutoCompleteOptions();
    this.optionAutoComplete.autocomplete = 'on';
    this.optionAutoComplete.debounce = 750;
    this.optionAutoComplete.placeholder = 'Barcode / Name';

    this.form = this.fb.group({      
      name: ['', [Validators.required]],
      parent: ['', [Validators.required]]
    });    
    this.collections_with_level.push({
      _id: 'root',
      name: 'Root',
      parents: []
    })
  }  

  ngOnInit() {
    this.utilService.get('product/collection', {}).subscribe(result => {
      if(result && result.body) {
        for(let c of result.body) {
          let collection = new Collection(this.authService, this.utilService);
          collection.loadDetails(c);
          this.all_collections.push(collection);
        }
        this.getCollectionsWithLevel();
        this.all_sub_collections = this.getAllSubCollections(null);         
        this.init();
      }      
    })      
  }

  init() {
    this.setParents();
    this.loadFormData();
  }  

  ionViewDidEnter() {
    this.loadFormData();
  }

  loadFormData() {
    if(this.collection._id) {      
      this.title = 'Edit Collection';
    }
    this.form.get('name').setValue(this.collection.name);
    let parent = this.collectionService.parent._id;
    if(!parent) parent = 'root';
    this.form.get('parent').setValue(parent);
  }

  public get collection():Collection {
    return this.collectionService.collection;
  }

  getCollectionsWithLevel() {
    for(let c of this.all_collections) {
      let pp = this.getAllParentCollections(c._id);
      let name = '-'.repeat(pp.length) + c.name;
      this.collections_with_level.push({
        _id: c._id,
        name: name,
        parents: pp
      })
    }
  }

  setParents() {    
    this.parents = [{
      _id: 'root',
      name: 'Root',
      parents: []
    }];    
    let sub_collections:Collection[] = [];
    if(this.collection._id) {
      sub_collections = this.getAllSubCollections(this.collection._id);
    }
    for(let c of this.all_sub_collections) {
      let index = sub_collections.findIndex(item => item._id == c._id);        
      if(index == -1 && c._id != this.collection._id) {
        index = this.collections_with_level.findIndex(item => item._id == c._id);
        this.parents.push(this.collections_with_level[index]);
      }
    }
  }

  getCollectionById(_id:string):Collection {
    let index = this.all_collections.findIndex(item => item._id == _id);
    if(index>-1) {
      return this.all_collections[index];
    }
    return null;
  }

  getAllParentCollections(_id:string):Collection[] {    
    let self = this.getCollectionById(_id);
    if(self.parent) {
      return [self].concat(this.getAllParentCollections(self.parent._id));
    } else {
      return [self];
    }
  }

  getAllSubCollections(_id:string):Collection[] {    
    let collections = [];
    for(let c of this.all_collections) {
      if(_id == null && c.parent==null || (c.parent!=null && c.parent._id == _id)) {
        collections.push(c);
        let sub = this.getAllSubCollections(c._id);
        if(sub.length>0){
          collections = collections.concat(sub);
        }
      }
    }
    return collections;
  }

  selProduct(event) {
    if(event.product) {
      this.collection.addProduct(event.product);
    }
    this.searchbar.clearValue();    
  }

  removeProduct(index: number) {
    this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this product?', () => {
      this.collection.products.splice(index, 1);
    })
  }

  handleAction(action: string, collection?:any) {
    if(action == 'add') {
      this.collectionService.parent = this.getCollectionById(this.collection._id);
      this.collectionService.init();
      this.init(); 
    }
    if(action == 'edit') {      
      this.collectionService.parent = this.getCollectionById(this.collection._id);
      this.collectionService.init(collection._id, () => {
        this.init();
      });      
    }
    if(action == 'delete') {
      this.alertService.presentAlertConfirm('Confirm Delete', 'Are you sure to want to delete this collection?', () => {
        let c = new Collection(this.authService, this.utilService);
        c.loadById(collection._id, () => {
          c.delete(() => {
            this.collectionService.changed = true;
            let index = this.collection.children.findIndex(item=>item._id == collection._id);
            if(index>-1) {
              this.collection.children.splice(index, 1);
            }
          })
        })
      })      
    }
  }

  async submit(){
    this.isSubmitted = true;
    if(this.form.valid){
      this.collection.name = this.nameInput.value;
      this.collection.parent = this.getCollectionById(this.parentInput.value);
      await this.loading.create();
      this.collection.save(async result => {
        await this.loading.dismiss();
        if(result && result.body && result.body.status == 'already_exist'){
          this.toastService.show('Already existing collection');
        } else {
          this.toastService.show(Constants.message.successSaved);
          this.collectionService.changed = true;
          this.nav.navigateBack(['main/ecommerce/collections']);
        }        
      }, async () => {
        await this.loading.dismiss();
        this.toastService.show(Constants.message.failedSave);
      })
    }    
  }

  openAddToCollection() {
    this.nav.navigateForward(['add-to-collection']);
  }

  back() {
    this.nav.back();
  }
  
  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get parentInput(): any {return this.form.get('parent'); }
  get parentInputError(): string {
    if (this.parentInput.hasError('required')) {return Constants.message.requiredField; }    
  }

}
