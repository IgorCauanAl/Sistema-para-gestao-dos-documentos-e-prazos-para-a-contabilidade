import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { AttachDocumentModalComponent } from './attach-document-modal.component';

describe('AttachDocumentModalComponent', () => {
  let component: AttachDocumentModalComponent;
  let fixture: ComponentFixture<AttachDocumentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachDocumentModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(AttachDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
