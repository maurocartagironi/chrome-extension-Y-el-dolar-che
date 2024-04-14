import { TestBed } from '@angular/core/testing';

import { DolarAPIService } from './dolar-api.service';

describe('DolarAPIService', () => {
  let service: DolarAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DolarAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
