const CNPJ_DIGITS = 14;

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
  return onlyCnpjDigits(value).length === CNPJ_DIGITS;
}

export function cnpjSearchHaystack(value: string | null | undefined): string {
  const digits = onlyCnpjDigits(value);
  return digits.length ? digits : (value ?? '').toLowerCase();
}
