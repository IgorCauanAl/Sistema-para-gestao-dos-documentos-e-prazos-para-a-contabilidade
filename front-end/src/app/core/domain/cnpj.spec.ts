import { formatCnpj, isValidCnpj, maskCnpjInput, onlyCnpjDigits } from './cnpj';

describe('cnpj utils', () => {
  it('formata CNPJ com 14 dígitos', () => {
    expect(formatCnpj('86489351000123')).toBe('86.489.351/0001-23');
    expect(formatCnpj('86.489.351/0001-23')).toBe('86.489.351/0001-23');
  });

  it('mascara entrada parcial', () => {
    expect(maskCnpjInput('86489351000123')).toBe('86.489.351/0001-23');
    expect(maskCnpjInput('8648')).toBe('86.48');
  });

  it('valida os dígitos verificadores com e sem máscara', () => {
    expect(isValidCnpj('86.489.351/0001-23')).toBe(true);
    expect(isValidCnpj('86489351000123')).toBe(true);
    expect(isValidCnpj('12.345.678/0001-95')).toBe(true);
    expect(isValidCnpj('00.000.000/0001-91')).toBe(true);
  });

  it('rejeita tamanho inválido e verificadores incorretos', () => {
    expect(isValidCnpj('11.111.111/1111-1')).toBe(false);
    expect(isValidCnpj('86489351000124')).toBe(false);
    expect(isValidCnpj('12.345.678/0001-90')).toBe(false);
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('864893510001234')).toBe(false);
    expect(isValidCnpj(null)).toBe(false);
  });

  it('extrai dígitos', () => {
    expect(onlyCnpjDigits('86.489.351/0001-23')).toBe('86489351000123');
  });
});
