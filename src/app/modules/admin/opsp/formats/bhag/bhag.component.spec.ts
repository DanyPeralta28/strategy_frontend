import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BhagComponent } from './bhag.component';

describe('BhagComponent', () => {
  let component: BhagComponent;
  let fixture: ComponentFixture<BhagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BhagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BhagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
