import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Constants } from 'src/app/_configs/constants';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-edit-timesheet',
  templateUrl: './edit-timesheet.component.html',
  styleUrls: ['./edit-timesheet.component.scss'],
})
export class EditTimesheetComponent implements OnInit {
  
  title:string = 'Add New Timesheet';  
  form: FormGroup;
  isSubmitted: boolean = false;  
  timesheet:any;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder,
    private utilService: UtilService
  ) {
    this.form = this.fb.group({
      start_date: ['', [Validators.required]],
      end_date: ['']
    })
  }

  ngOnInit() {
    if(this.timesheet._id) {
      this.title = 'Edit Timesheet';
      this.form.get('start_date').setValue(this.timesheet.start_date);
      this.form.get('end_date').setValue(this.timesheet.end_date);
    }
  }

  submit() {
    this.isSubmitted = true;
    if(this.form.valid) {
      const data = {
        _id: this.timesheet._id,
        start_date: this.form.get('start_date').value,
        end_date: this.form.get('end_date').value ? this.form.get('end_date').value : null,
        private_web_address: this.timesheet.private_web_address,
        user_id: this.timesheet.user_id
      };            
      if(this.timesheet._id) {
        delete data.private_web_address;
        delete data.user_id;
        this.utilService.put('auth/timesheet', data).subscribe(result => {          
          this.popoverController.dismiss({process: true});
        })
      } else {        
        delete data._id;        
        this.utilService.post('auth/timesheet', data).subscribe(result => {
          this.popoverController.dismiss({process: true});
        })
      }
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get startDateInput(): any {return this.form.get('start_date'); }
  get startDateInputError(): string {    
    if (this.startDateInput.hasError('required')) { return Constants.message.requiredField; }
  }

}
