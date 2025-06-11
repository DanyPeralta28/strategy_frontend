import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrataComponent } from './strata.component';

describe('StrataComponent', () => {
  let component: StrataComponent;
  let fixture: ComponentFixture<StrataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
