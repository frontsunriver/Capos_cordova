import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { DbService } from 'src/app/_services/db.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {
  total:number = 0;
  loaded: number = 0;
  user: any;
  
  constructor(
    private utilService: UtilService,    
    private authService: AuthService,
    private toastService: ToastService,
    private db: DbService,
    private nav: NavController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    })
  }

  ngOnInit() {
    if(this.utilService.isOnline && (!this.utilService.is_downloaded || !this.utilService.is_uploaded)) {
      this.loadData();
    } else {
      this.nav.navigateForward(['main/home']);
    }
  }

  loadData() {
    this.db.dbState().subscribe(res => {
      if(res) {
        this.db.getDbLogs(this.user.private_web_address, rows => {
          const query = {user_id: this.user._id, loaded_date:''};
          if(rows.length > 0) query.loaded_date = rows.item(0).loaded_date;
          this.utilService.get('util/get_all_data', query).subscribe(result => {            
            console.log(result);
            if(result && result.body) {
              const data = result.body;
              for(let mode in data) {
                for(let tb in data[mode]) this.total += data[mode][tb].length;
              }          
              for(let mode in data) {
                for(let tb in data[mode]) {                  
                  this.db.downloadData(mode, tb, data[mode][tb], loaded => {                
                    this.loaded += loaded;
                    if(this.loaded>=this.total) {
                      this.finish();                  
                    }
                  });
                }
              }            
            } else {          
              this.gotoHome(rows);
            }
          }, error => {
            this.gotoHome(rows);
          })      
        })
      }
    })        
  }

  finish() {
    this.utilService.is_downloaded = true;
    this.db.getCountries(countries => {                        
      this.utilService.countries = countries; 
    })
    this.db.getCurrencies(currencies => {
      this.utilService.currencies = currencies; 
    })
    this.db.updateDbLog(this.user.private_web_address);
    this.utilService.put('util/update_db_log', {user_id: this.user._id})
    this.nav.navigateForward(['main/home']);
  }

  gotoHome(rows) {
    if(rows.length == 0) {
      this.toastService.show('Can\'t load data from db. Please try again later.');
      //this.authService.logOut();
    }
    this.nav.navigateForward(['main/home']);
  }

  public get progress_value():number {
    if(this.total>0) {
      return this.loaded / this.total;
    }
    return 0;
  }

  public get progress_percent():string {    
    return Math.round(this.progress_value * 100) + '%';
  }

  public get loading_title():string {
    if(!this.utilService.is_downloaded) {
      return 'Downloading data';
    } else if(!this.utilService.is_uploaded) {
      return 'Uploading data';
    } else {
      return 'Checking data';
    }
  }

}
