import { Injectable } from '@angular/core';
import { AutoCompleteService } from 'ionic4-auto-complete';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../_classes/product.class';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

export interface IShortProduct{  
  name: string,
  barcode: string,
  product: Product
}

@Injectable({
  providedIn: 'root'
})
export class SearchProductService implements AutoCompleteService {
  labelAttribute: string = 'name';

  constructor(
    private authService: AuthService,
    private utilService: UtilService
  ) { }

  getResults(keyword): Observable<IShortProduct[]> {    
    this.labelAttribute = 'name';        
    
    let observable: Observable<IShortProduct[]>;
    
    let products:IShortProduct[] = [];

    if(keyword) {
      if(Number.isInteger(parseInt(keyword))) {
        this.labelAttribute = 'barcode';
      }
      observable = this.utilService.get('product/product', {range:'search', keyword: keyword}).pipe(
        map(
          (results:any) => {            
            if(results && results.body) {
              for(let p of results.body) {
                let product = new Product(this.authService, this.utilService);
                product.loadDetails(p);
                products.push({
                  product: product,
                  name: p.name,
                  barcode: p.barcode
                });
              }
            }
            return products;
          }
        )
      )  
    } else {
      observable = of(products);
    }
    return observable;    
  }
}
