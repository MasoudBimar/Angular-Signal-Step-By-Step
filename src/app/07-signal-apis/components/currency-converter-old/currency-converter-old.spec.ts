import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyConverterOld } from './currency-converter-old';

describe('CurrencyConverterOld', () => {
  let component: CurrencyConverterOld;
  let fixture: ComponentFixture<CurrencyConverterOld>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyConverterOld]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyConverterOld);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
