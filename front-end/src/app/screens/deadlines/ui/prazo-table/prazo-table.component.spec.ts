import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoTableComponent } from './prazo-table.component';

describe('PrazoTableComponent', () => {
  let component: PrazoTableComponent;
  let fixture: ComponentFixture<PrazoTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoTableComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
