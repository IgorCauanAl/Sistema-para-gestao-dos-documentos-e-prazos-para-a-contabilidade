import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { BatchActionsBarComponent } from './batch-actions-bar.component';

describe('BatchActionsBarComponent', () => {
  let component: BatchActionsBarComponent;
  let fixture: ComponentFixture<BatchActionsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchActionsBarComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(BatchActionsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
