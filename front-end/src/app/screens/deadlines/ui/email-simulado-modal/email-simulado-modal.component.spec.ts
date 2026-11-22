import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { EmailSimuladoModalComponent } from './email-simulado-modal.component';

describe('EmailSimuladoModalComponent', () => {
  let component: EmailSimuladoModalComponent;
  let fixture: ComponentFixture<EmailSimuladoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSimuladoModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(EmailSimuladoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
