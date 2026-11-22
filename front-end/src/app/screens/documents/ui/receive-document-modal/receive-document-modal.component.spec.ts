import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { ReceiveDocumentModalComponent } from './receive-document-modal.component';

describe('ReceiveDocumentModalComponent', () => {
  let component: ReceiveDocumentModalComponent;
  let fixture: ComponentFixture<ReceiveDocumentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiveDocumentModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiveDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
