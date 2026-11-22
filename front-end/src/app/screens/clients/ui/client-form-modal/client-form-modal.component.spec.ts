import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { ClientFormModalComponent } from './client-form-modal.component';

describe('ClientFormModalComponent', () => {
  let component: ClientFormModalComponent;
  let fixture: ComponentFixture<ClientFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFormModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
