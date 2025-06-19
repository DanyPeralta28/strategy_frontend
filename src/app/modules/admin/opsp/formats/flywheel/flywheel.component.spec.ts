import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlywheelComponent } from './flywheel.component';

describe('FlywheelComponent', () => {
  let component: FlywheelComponent;
  let fixture: ComponentFixture<FlywheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlywheelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlywheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
