import { Injectable } from '@angular/core';
import { Collection } from '../_classes/collection.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  view_parent:Collection = null;  
  parent:Collection = null;
  collection:Collection = null;
  changed: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) {     
    this.init_view();
    this.init();
  }

  init_view() {
    this.view_parent = new Collection(this.authService, this.utilService);   
  }

  init(_id?: string, callback?:Function) {
    if(!this.parent) {
      this.parent = new Collection(this.authService, this.utilService);
    }
    this.collection = new Collection(this.authService, this.utilService);
    if(_id) {
      this.collection.loadById(_id, () => {
        if(callback) callback();
      });
    }
  }
}
