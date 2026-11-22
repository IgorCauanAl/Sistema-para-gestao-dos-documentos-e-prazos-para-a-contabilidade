import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { DocumentsTabsComponent } from './documents-tabs.component';

describe('DocumentsTabsComponent', () => {
  let component: DocumentsTabsComponent;
  let fixture: ComponentFixture<DocumentsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsTabsComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
