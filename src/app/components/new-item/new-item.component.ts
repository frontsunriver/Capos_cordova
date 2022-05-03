import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import * as UtilFunc from 'src/app/_helpers/util.helper';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-new-item',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.scss'],
})
export class NewItemComponent implements OnInit {
  form: FormGroup;
  util = UtilFunc;
  user: any;
  url:string = '';
  item_name: string = '';
  isSubmitted: boolean = false;
  dup_error:boolean = false;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private toastService: ToastService,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      name:['', [Validators.required]]
    }); 
  }

  ngOnInit() {}

  submit(){
    this.isSubmitted = true;
    this.dup_error = false;
    if(this.form.valid){      
      const data = this.form.value;
      data.private_web_address = this.user.private_web_address;                    
      this.utilService.post(this.url, data).subscribe(result => {
        if(result && result.body.status == 'already_exist') {
          this.dup_error = true;
          this.toastService.show(Constants.message.duplicateItem.replace('?', this.item_name));
        } else {
          this.popoverController.dismiss({process: true, result: result.body});
        }        
      }, error => {
        this.toastService.show(error);
      });
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }   
    if(this.dup_error) return 'Already existing name'; 
  }
}
