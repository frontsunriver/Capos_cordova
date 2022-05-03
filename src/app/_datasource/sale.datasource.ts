import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, Observable } from "rxjs";
import { Cart } from 'src/app/_classes/cart.class';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilService } from 'src/app/_services/util.service';

export class SaleDataSource implements DataSource<Cart> {
	private cartsSubject = new BehaviorSubject<Cart[]>([]);
	private loadingSubject = new BehaviorSubject<boolean>(false);
	public loading:boolean = false;// = this.loadingSubject.asObservable();
  
	public data:Cart[] = [];
	public totalElements: number = 0;
	public totalSum: number = 0;
  
	constructor(
		private authService: AuthService,
		private utilService: UtilService
	) {

	}

	connect(collectionViewer: CollectionViewer): Observable<Cart[] | readonly Cart[]> {
		return this.cartsSubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.cartsSubject.complete();
		this.loadingSubject.complete();
	}

	loadCarts(
		filter?:any,
		page?:number,
		size?:number,
		callback?:Function)
	{
		this.loadingSubject.next(true);
		this.loading = true;
		if(typeof page =='undefined') page = 0;
		if(!size) size = 30;		
		const query = {...filter, page, size}; 		
		this.data = [];
		this.totalElements = 0;
		this.totalSum = 0;
		this.utilService.get('sale/sale', query).subscribe(result => {			
			if(result && result.body) {
				for(let _cart of result.body.data) {
					let cart = new Cart(this.authService, this.utilService);
					cart.loadByCart(_cart);
					this.data.push(cart);
				}
				this.totalElements = result.body.totalElements;				
				this.totalSum = result.body.sum_total;
				this.cartsSubject.next(this.data);
			}
			this.loadingSubject.next(false);
			this.loading = false;
			if(callback) callback(this.data);
		}, () => {
			this.loading = false;
			this.loadingSubject.next(false);
			if(callback) callback(this.data);
		});
	}
}