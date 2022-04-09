import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeaponWheelComponent } from './weapon-wheel.component';

describe('WeaponWheelComponent', () => {
  let component: WeaponWheelComponent;
  let fixture: ComponentFixture<WeaponWheelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeaponWheelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeaponWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
