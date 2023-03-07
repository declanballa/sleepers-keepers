import { TestBed } from '@angular/core/testing';

import { NflDataService } from './nfl-data.service';

describe('NlfDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NflDataService = TestBed.get(NflDataService);
    expect(service).toBeTruthy();
  });
});
