import { TestBed } from '@angular/core/testing';

import { UiManagerService } from './ui-manager.service';

describe('UiManagerService', () => {
  let service: UiManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
