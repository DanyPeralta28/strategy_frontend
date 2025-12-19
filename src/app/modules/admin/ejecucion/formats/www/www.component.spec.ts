import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WwwComponent } from './www.component';

describe('WwwComponent', () => {
  let component: WwwComponent;
  let fixture: ComponentFixture<WwwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwwComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WwwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
