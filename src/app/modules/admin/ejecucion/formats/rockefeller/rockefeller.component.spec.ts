import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RockefellerComponent } from './rockefeller.component';

describe('RockefellerComponent', () => {
  let component: RockefellerComponent;
  let fixture: ComponentFixture<RockefellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RockefellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RockefellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
