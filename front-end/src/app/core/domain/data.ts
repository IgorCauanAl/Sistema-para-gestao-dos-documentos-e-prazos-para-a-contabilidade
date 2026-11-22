const pad = (n: number) => String(n).padStart(2, '0');

export const formatarData = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export const formatarHora = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export interface DataHora {
  data: string;
  hora: string;
}

export const agora = (): DataHora => ({ data: formatarData(new Date()), hora: formatarHora(new Date()) });

export const paraISO = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const paraBR = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const paraData = (br: string | null | undefined): Date | null => {
  if (!br) return null;
  const [dia, mes, ano] = br.split('/').map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
};

export const diasDesde = (br: string): number => {
  const alvo = paraData(br);
  if (!alvo) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hoje.getTime() - alvo.getTime()) / 86400000));
};

export const dataBRParaISO = (br: string): string => {
  if (!br) return '';
  const [dia, mes, ano] = br.split('/');
  return `${ano}-${mes}-${dia}`;
};

