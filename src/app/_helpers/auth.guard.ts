import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { UtilService } from '../_services/util.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private router: Router,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {    
    if (this.authService.isLoggedIn) {
      if(this.utilService.isOnline && (!this.utilService.is_downloaded || !this.utilService.is_uploaded)) {
        this.router.navigateByUrl('loading');
      } else {
        return true;  
      }
    }
    else {this.router.navigateByUrl('static/home'); }
  }
  
}
