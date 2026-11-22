import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrioridadeBadgeComponent } from './prioridade-badge.component';

describe('PrioridadeBadgeComponent', () => {
  let component: PrioridadeBadgeComponent;
  let fixture: ComponentFixture<PrioridadeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioridadeBadgeComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrioridadeBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
