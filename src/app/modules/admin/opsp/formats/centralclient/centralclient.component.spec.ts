import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralclientComponent } from './centralclient.component';

describe('CentralclientComponent', () => {
  let component: CentralclientComponent;
  let fixture: ComponentFixture<CentralclientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralclientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
