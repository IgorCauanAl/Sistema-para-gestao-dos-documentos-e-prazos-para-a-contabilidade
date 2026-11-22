import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoStatusBadgeComponent } from './prazo-status-badge.component';

describe('PrazoStatusBadgeComponent', () => {
  let component: PrazoStatusBadgeComponent;
  let fixture: ComponentFixture<PrazoStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoStatusBadgeComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoStatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
