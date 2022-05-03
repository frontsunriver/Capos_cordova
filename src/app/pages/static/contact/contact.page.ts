import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/_configs/constants';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  public title: string;
  form: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      company: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      enquiry: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.title = 'Contact Us';
  }

  submit() {
    this.isSubmitted = true;
    if(this.form.valid) {

    }
  }

  get nameInput(): any {return this.form.get('name'); }
  get nameInputError(): string {
    if (this.nameInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get companyInput(): any {return this.form.get('company'); }
  get companyInputError(): string {
    if (this.companyInput.hasError('required')) {return Constants.message.requiredField; }    
  }

  get emailInput(): any {return this.form.get('email'); }
  get emailInputError(): string {
    if (this.emailInput.hasError('required')) {return Constants.message.requiredField; }    
    if (this.emailInput.hasError('email')) {return Constants.message.validEmail; }    
  }

  get enquiryInput(): any {return this.form.get('enquiry'); }
  get enquiryInputError(): string {
    if (this.enquiryInput.hasError('required')) {return Constants.message.requiredField; }    
  }

}
