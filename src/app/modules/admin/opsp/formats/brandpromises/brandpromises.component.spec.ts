import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandpromisesComponent } from './brandpromises.component';

describe('BrandpromisesComponent', () => {
  let component: BrandpromisesComponent;
  let fixture: ComponentFixture<BrandpromisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandpromisesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandpromisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
