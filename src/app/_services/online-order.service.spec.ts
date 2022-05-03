import { TestBed } from '@angular/core/testing';

import { OnlineOrderService } from './online-order.service';

describe('OnlineOrderService', () => {
  let service: OnlineOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
