import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancekpisComponent } from './balancekpis.component';

describe('BalancekpisComponent', () => {
  let component: BalancekpisComponent;
  let fixture: ComponentFixture<BalancekpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalancekpisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancekpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
