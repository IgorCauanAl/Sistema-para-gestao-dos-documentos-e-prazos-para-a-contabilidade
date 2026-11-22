import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../testing/test-providers';

import { SolicitacaoDetailPageComponent } from './solicitacao-detail-page.component';

describe('SolicitacaoDetailPageComponent', () => {
  let component: SolicitacaoDetailPageComponent;
  let fixture: ComponentFixture<SolicitacaoDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoDetailPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
