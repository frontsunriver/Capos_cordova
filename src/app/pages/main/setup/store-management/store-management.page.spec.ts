import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreManagementPage } from './store-management.page';

describe('StoreManagementPage', () => {
  let component: StoreManagementPage;
  let fixture: ComponentFixture<StoreManagementPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreManagementPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
