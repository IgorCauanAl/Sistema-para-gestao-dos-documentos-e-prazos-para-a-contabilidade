import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoFieldsComponent } from './prazo-fields.component';

describe('PrazoFieldsComponent', () => {
  let component: PrazoFieldsComponent;
  let fixture: ComponentFixture<PrazoFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoFieldsComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
