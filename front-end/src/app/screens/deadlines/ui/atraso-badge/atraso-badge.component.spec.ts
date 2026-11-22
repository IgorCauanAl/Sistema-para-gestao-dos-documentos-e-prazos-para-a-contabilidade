import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { AtrasoBadgeComponent } from './atraso-badge.component';

describe('AtrasoBadgeComponent', () => {
  let component: AtrasoBadgeComponent;
  let fixture: ComponentFixture<AtrasoBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtrasoBadgeComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(AtrasoBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
