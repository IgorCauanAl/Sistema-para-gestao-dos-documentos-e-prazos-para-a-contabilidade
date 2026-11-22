import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { EtapasChecklistComponent } from './etapas-checklist.component';

describe('EtapasChecklistComponent', () => {
  let component: EtapasChecklistComponent;
  let fixture: ComponentFixture<EtapasChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapasChecklistComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(EtapasChecklistComponent);
    component = fixture.componentInstance;
    component.prazo = { status: 'EM_ANDAMENTO', etapasConcluidas: [], etapaAtual: 0 } as never;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
