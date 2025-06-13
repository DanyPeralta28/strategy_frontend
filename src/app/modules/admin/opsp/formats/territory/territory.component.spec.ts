import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryComponent } from './territory.component';

describe('TerritoryComponent', () => {
  let component: TerritoryComponent;
  let fixture: ComponentFixture<TerritoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerritoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
