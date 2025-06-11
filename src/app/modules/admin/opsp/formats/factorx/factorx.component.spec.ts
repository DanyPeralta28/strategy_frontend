import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorxComponent } from './factorx.component';

describe('FactorxComponent', () => {
  let component: FactorxComponent;
  let fixture: ComponentFixture<FactorxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactorxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
