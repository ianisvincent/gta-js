import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordControllerComponent } from './word-controller.component';

describe('WordControllerComponent', () => {
  let component: WordControllerComponent;
  let fixture: ComponentFixture<WordControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
