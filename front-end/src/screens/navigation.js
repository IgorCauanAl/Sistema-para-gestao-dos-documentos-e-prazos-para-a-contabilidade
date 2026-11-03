import { LayoutDashboard } from 'lucide-react';

export const navigationTabs = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'Clientes', label: 'Clientes', icon: null, path: '/clientes' },
  { id: 'Documentos', label: 'Documentos', icon: null, path: '/documentos' },
  { id: 'Prazos', label: 'Prazos', icon: null, path: '/prazos' },
  { id: 'Solicitações', label: 'Solicitações', icon: null, path: '/solicitacoes' },
];

export const isTabActive = (tab, pathname) =>
  tab.path === '/' ? pathname === '/' : pathname === tab.path || pathname.startsWith(`${tab.path}/`);
