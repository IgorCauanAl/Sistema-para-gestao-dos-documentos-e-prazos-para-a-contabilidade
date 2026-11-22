import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { RejectItemModalComponent } from './reject-item-modal.component';

describe('RejectItemModalComponent', () => {
  let component: RejectItemModalComponent;
  let fixture: ComponentFixture<RejectItemModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectItemModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(RejectItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
