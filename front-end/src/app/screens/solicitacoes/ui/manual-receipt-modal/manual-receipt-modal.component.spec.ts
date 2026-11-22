import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { ManualReceiptModalComponent } from './manual-receipt-modal.component';

describe('ManualReceiptModalComponent', () => {
  let component: ManualReceiptModalComponent;
  let fixture: ComponentFixture<ManualReceiptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualReceiptModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ManualReceiptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
