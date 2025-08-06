import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptcashComponent } from './optcash.component';

describe('OptcashComponent', () => {
  let component: OptcashComponent;
  let fixture: ComponentFixture<OptcashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptcashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptcashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
