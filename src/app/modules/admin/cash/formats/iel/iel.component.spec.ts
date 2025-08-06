import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IelComponent } from './iel.component';

describe('IelComponent', () => {
  let component: IelComponent;
  let fixture: ComponentFixture<IelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
