const pad = (n) => String(n).padStart(2, '0');

export const formatarData = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export const formatarHora = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const agora = () => ({ data: formatarData(new Date()), hora: formatarHora(new Date()) });

export const somaDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
};

export const paraISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const paraBR = (iso) => {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const paraData = (br) => {
  if (!br) return null;
  const [dia, mes, ano] = br.split('/').map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
};

export const diasDesde = (br) => {
  const alvo = paraData(br);
  if (!alvo) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hoje.getTime() - alvo.getTime()) / 86400000));
};

export const dataBRParaISO = (br) => {
  if (!br) return '';
  const [dia, mes, ano] = br.split('/');
  return `${ano}-${mes}-${dia}`;
};

export const ipAleatorio = () => {
  const oct = () => Math.floor(Math.random() * 250) + 2;
  return `${oct()}.${oct()}.${oct()}.${oct()}`;
};

export const tokenAleatorio = () => {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 12; i += 1) out += hex[Math.floor(Math.random() * 16)];
  return out;
};
