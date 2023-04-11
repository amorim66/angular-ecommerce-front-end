import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileResponsiveComponent } from './mobile-responsive.component';

describe('MobileResponsiveComponent', () => {
  let component: MobileResponsiveComponent;
  let fixture: ComponentFixture<MobileResponsiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileResponsiveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileResponsiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
