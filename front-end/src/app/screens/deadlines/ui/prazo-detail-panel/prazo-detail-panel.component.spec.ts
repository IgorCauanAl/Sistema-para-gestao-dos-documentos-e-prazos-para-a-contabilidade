import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoDetailPanelComponent } from './prazo-detail-panel.component';

describe('PrazoDetailPanelComponent', () => {
  let component: PrazoDetailPanelComponent;
  let fixture: ComponentFixture<PrazoDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoDetailPanelComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
