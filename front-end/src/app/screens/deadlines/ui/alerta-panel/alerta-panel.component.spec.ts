import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { AlertaPanelComponent } from './alerta-panel.component';

describe('AlertaPanelComponent', () => {
  let component: AlertaPanelComponent;
  let fixture: ComponentFixture<AlertaPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaPanelComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
