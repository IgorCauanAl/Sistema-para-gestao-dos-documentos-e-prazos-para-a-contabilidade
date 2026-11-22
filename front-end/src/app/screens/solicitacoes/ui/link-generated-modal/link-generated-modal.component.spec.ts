import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { LinkGeneratedModalComponent } from './link-generated-modal.component';

describe('LinkGeneratedModalComponent', () => {
  let component: LinkGeneratedModalComponent;
  let fixture: ComponentFixture<LinkGeneratedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkGeneratedModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(LinkGeneratedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
