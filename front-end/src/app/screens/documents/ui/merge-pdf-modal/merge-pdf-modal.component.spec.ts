import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { MergePdfModalComponent } from './merge-pdf-modal.component';

describe('MergePdfModalComponent', () => {
  let component: MergePdfModalComponent;
  let fixture: ComponentFixture<MergePdfModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergePdfModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(MergePdfModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
