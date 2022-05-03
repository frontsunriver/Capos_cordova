import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Group } from 'src/app/_classes/group.class';
import { Constants } from 'src/app/_configs/constants';
import { LoadingService } from 'src/app/_services/loading.service';
import { ToastService } from 'src/app/_services/toast.service';
import { UtilService } from 'src/app/_services/util.service';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss'],
})
export class EditGroupComponent implements OnInit {
  title:string = 'Add New Group';
  duplicate_error:boolean = false;
  isSubmitted: boolean = false;
  form: FormGroup;
  group: Group;

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
    private popoverController: PopoverController,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      limit: ['']
    });
  }

  ngOnInit() {
    if(this.group._id) {
      this.title = 'Edit Group';
      this.form.get('name').setValue(this.group.name);
      this.form.get('limit').setValue(this.group.limit);
    }
  }

  async submit() {
    this.isSubmitted = true;
    if(this.form.invalid) return;
    await this.loading.create();
    const data = this.form.value;
    if(!data.limit) data.limit = 0;
    this.group.name = data.name;
    this.group.limit = data.limit;
    this.group.save(async result => {
      await this.final_process(result);
    })  }

  async final_process(result) {
    await this.loading.dismiss();    
    this.toastService.show(Constants.message.successSaved);
    this.popoverController.dismiss({process: true});
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }
    if(this.duplicate_error) return 'Already exising group.';    
  }
}
