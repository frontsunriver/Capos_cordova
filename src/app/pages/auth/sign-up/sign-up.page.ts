import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Constants } from 'src/app/_configs/constants';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastService } from 'src/app/_services/toast.service';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/_services/util.service';
import { LoadingService } from 'src/app/_services/loading.service';
import { CurrencyModel } from 'src/app/_models/currency-model';
import { CountryModel } from 'src/app/_models/country-model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignUpPage implements OnInit {
    @ViewChild(IonContent) content: IonContent;

  isSubmitted: boolean = false;
  title: string = 'Sign Up';
  hide = true;
  form: FormGroup;
  phoneNumber: string;
  submitted: boolean;  
  countryList: CountryModel[] = [];
  currencies: CurrencyModel[] = [];
  duplicatedWebAdd: boolean = false;
  duplicatedStoreName: boolean = false;
  duplicatedEmail: boolean = false;
  private ipAddress: any;
  sticky:boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private utilService: UtilService,
    private nav: NavController,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
        private_web_address: ['', [Validators.required, Validators.minLength(8)]],
        store_name: ['', [Validators.required]],
        first_name: ['', Validators.required],
        last_name: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
        country: [''],
        default_currency: ['']
    });
    this.countryList = this.utilService.countries;    
    this.currencies = this.utilService.currencies;    
  }

  ngOnInit(): void {
    
  }

	ionViewDidEnter(){
    this.content.scrollToTop();
  }

  scroll(event:any) {    
    const num = event.detail.scrollTop;
    this.sticky = num > 40;
  }  

  async submit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }    
    if(!this.utilService.isOnline) {
      this.toastService.show('Can\'t register on offline mode. Please use on online mode');
      return;
    }
    this.form.value.ip_address = this.ipAddress;    
    this.form.value.phone = this.phoneNumber;
    await this.loading.create();
    this.authService.signUp(this.form.value).subscribe(async result => {      
      await this.loading.dismiss();
      const s = result; let msg = 'User registered successfully';      
      if(s.status) {
        if(s.status.private_web_address == 1) {
          this.duplicatedWebAdd = true;
        }
        if(s.status.store_name == 1) {
          this.duplicatedStoreName = true;
        }
        if(s.status.email == 1) {
          this.duplicatedEmail = true;
        }
      } else {        
        if(s.sent_email) {
          msg += '<br>Please verify your email.';          
        }
        this.toastService.show(msg);
        this.nav.navigateForward(['auth/sign-in']);
      }
    }, async error => {      
      await this.loading.dismiss();
      this.toastService.show('Please check your information');
    });
  }

  onKeydown(field: string) {
    if(field == 'private_web_address') this.duplicatedWebAdd = false;
    if(field == 'store_name') this.duplicatedStoreName = false;
    if(field == 'email') this.duplicatedEmail = false;
    return true;
  }

  onKeypress(event) {
    var key = event.keyCode;
    if (key === 32) {
      event.preventDefault();
    }
  }

  get privateWebAddressInput(): any {return this.form.get('private_web_address'); }

  get privateWebAddressInputError(): string {
    if (this.privateWebAddressInput.hasError('required')) {return Constants.message.requiredField; }
    else if (this.privateWebAddressInput.hasError('minlength')) {return 'This field must be more than 8 letters'; }
    else if (this.duplicatedWebAdd) {return 'This Private Web Address is already in use'; }
  }

  get storeNameInput(): any {return this.form.get('store_name'); }
  get storeNameInputError(): string {
    if (this.storeNameInput.hasError('required')) { return Constants.message.requiredField; }
    else if (this.duplicatedStoreName) {return 'This Store Name is already in use'; }
  }

  get firstNameInput(): any {return this.form.get('first_name'); }
  get firstNameInputError(): string {
    if (this.firstNameInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('email')) { return Constants.message.validEmail; }
    else if (this.emailInput.hasError('required')) { return Constants.message.requiredField; }
    else if (this.duplicatedEmail) {return Constants.message.duplicatedEmail; }
  }

  get phoneNumberInput(): any {return this.form.get('phone'); }
  get phoneNumberInputError(): any {
    if (this.phoneNumberInput.hasError('required')) { return Constants.message.requiredField; }    
  }

  get passwordInput(): any {return this.form.get('password'); }
  get passwordInputError(): string {
    if (this.passwordInput.hasError('required')) { return Constants.message.requiredField; }
    if (this.passwordInput.hasError('minlength')) { return Constants.message.invalidMinLength.replace('?', Constants.password.minLength.toString()); }
    if (this.passwordInput.hasError('maxlength')) { return Constants.message.invalidMaxLength.replace('?', Constants.password.maxLength.toString()); }
  }

  get countryInput(): any {return this.form.get('country'); }
  get countryInputError(): string {
    if (this.countryInput.hasError('required')) { return Constants.message.requiredField; }
  }

  get currencyInput(): any {return this.form.get('default_currency'); }
  get currencyInputError(): string {
    if (this.currencyInput.hasError('required')) { return Constants.message.requiredField; }
  }
}