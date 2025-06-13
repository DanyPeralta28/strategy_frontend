import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilidadxComponent } from './utilidadx.component';

describe('UtilidadxComponent', () => {
  let component: UtilidadxComponent;
  let fixture: ComponentFixture<UtilidadxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilidadxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilidadxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
