import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditOnlineOrderProductComponent } from './edit-online-order-product.component';

describe('EditOnlineOrderProductComponent', () => {
  let component: EditOnlineOrderProductComponent;
  let fixture: ComponentFixture<EditOnlineOrderProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOnlineOrderProductComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditOnlineOrderProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
