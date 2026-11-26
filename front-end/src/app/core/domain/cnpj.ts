const CNPJ_DIGITS = 14;

/** Mensagem única de validação, compartilhada com o contrato da API. */
export const CNPJ_INVALID_MESSAGE =
  'CNPJ inválido. Informe os 14 dígitos com os verificadores corretos.';

const PRIMARY_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECONDARY_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function checkDigit(digits: number[], weights: number[]): number {
  const remainder = digits.reduce((sum, digit, index) => sum + digit * weights[index]!, 0) % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function onlyCnpjDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '').slice(0, CNPJ_DIGITS);
}

export function formatCnpj(value: string | null | undefined): string {
  const digits = onlyCnpjDigits(value);
  if (digits.length !== CNPJ_DIGITS) return (value ?? '').trim();
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function maskCnpjInput(value: string | null | undefined): string {
  const digits = onlyCnpjDigits(value);
  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 5);
  const p3 = digits.slice(5, 8);
  const p4 = digits.slice(8, 12);
  const p5 = digits.slice(12, 14);

  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `/${p4}`;
  if (p5) out += `-${p5}`;
  return out;
}

export function isValidCnpj(value: string | null | undefined): boolean {
  const digits = (value ?? '').replace(/\D/g, '');
  if (digits.length !== CNPJ_DIGITS) return false;

  const numeros = [...digits].map(Number);
  const base = numeros.slice(0, 12);
  const primeiro = checkDigit(base, PRIMARY_WEIGHTS);
  const segundo = checkDigit([...base, primeiro], SECONDARY_WEIGHTS);
  return numeros[12] === primeiro && numeros[13] === segundo;
}

export function cnpjSearchHaystack(value: string | null | undefined): string {
  const digits = onlyCnpjDigits(value);
  return digits.length ? digits : (value ?? '').toLowerCase();
}
