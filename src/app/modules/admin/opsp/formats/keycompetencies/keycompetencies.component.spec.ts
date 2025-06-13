import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeycompetenciesComponent } from './keycompetencies.component';

describe('KeycompetenciesComponent', () => {
  let component: KeycompetenciesComponent;
  let fixture: ComponentFixture<KeycompetenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeycompetenciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeycompetenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
