import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { NovaSolicitacaoModalComponent } from './nova-solicitacao-modal.component';

describe('NovaSolicitacaoModalComponent', () => {
  let component: NovaSolicitacaoModalComponent;
  let fixture: ComponentFixture<NovaSolicitacaoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaSolicitacaoModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(NovaSolicitacaoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
