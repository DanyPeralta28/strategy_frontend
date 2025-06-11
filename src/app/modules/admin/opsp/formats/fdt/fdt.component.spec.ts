import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FdtComponent } from './fdt.component';

describe('FdtComponent', () => {
  let component: FdtComponent;
  let fixture: ComponentFixture<FdtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FdtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FdtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
