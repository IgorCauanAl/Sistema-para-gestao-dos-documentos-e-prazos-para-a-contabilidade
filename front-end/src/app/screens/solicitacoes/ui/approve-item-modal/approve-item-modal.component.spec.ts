import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { ApproveItemModalComponent } from './approve-item-modal.component';

describe('ApproveItemModalComponent', () => {
  let component: ApproveItemModalComponent;
  let fixture: ComponentFixture<ApproveItemModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveItemModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
