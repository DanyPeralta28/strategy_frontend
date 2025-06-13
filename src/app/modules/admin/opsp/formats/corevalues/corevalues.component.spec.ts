import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorevaluesComponent } from './corevalues.component';

describe('CorevaluesComponent', () => {
  let component: CorevaluesComponent;
  let fixture: ComponentFixture<CorevaluesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorevaluesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorevaluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
