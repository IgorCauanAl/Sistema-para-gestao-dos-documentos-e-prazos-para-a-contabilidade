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

  it('valida tamanho', () => {
    expect(isValidCnpj('86.489.351/0001-23')).toBeTrue();
    expect(isValidCnpj('11.111.111/1111-1')).toBeFalse();
  });

  it('extrai dígitos', () => {
    expect(onlyCnpjDigits('86.489.351/0001-23')).toBe('86489351000123');
  });
});
