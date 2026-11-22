import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../testing/test-providers';

import { SolicitacoesPageComponent } from './solicitacoes-page.component';

describe('SolicitacoesPageComponent', () => {
  let component: SolicitacoesPageComponent;
  let fixture: ComponentFixture<SolicitacoesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacoesPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacoesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
