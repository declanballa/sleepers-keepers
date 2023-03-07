import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeepersShellComponent } from './keepers-shell.component';

describe('KeepersShellComponent', () => {
  let component: KeepersShellComponent;
  let fixture: ComponentFixture<KeepersShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeepersShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeepersShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
