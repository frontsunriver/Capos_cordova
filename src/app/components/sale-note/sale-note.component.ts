import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sale-note',
  templateUrl: './sale-note.component.html',
  styleUrls: ['./sale-note.component.scss'],
})
export class SaleNoteComponent implements OnInit {  
  form: FormGroup;
  button_label = 'Add';
  data:any

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      note:['']
    });    
  }

  ngOnInit() {
    if(this.data.note) this.form.get('note').setValue(this.data.note);
    if(this.data.item) this.button_label = this.data.item + ' Sale';
  }

  doAction(){
    if(this.form.valid){     
      let note = this.form.get('note').value;
      this.popoverController.dismiss({process: true, note: note});
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }

}
