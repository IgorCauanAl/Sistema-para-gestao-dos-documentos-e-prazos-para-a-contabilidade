import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppShell from './core/layout/AppShell';
import DashboardPage from './screens/dashboard/DashboardPage';
import ClientsPage from './screens/clients/ClientsPage';
import ClientDetailPage from './screens/client-detail/ClientDetailPage';
import DocumentsPage from './screens/documents/DocumentsPage';
import DeadlinesPage from './screens/deadlines/DeadlinesPage';
import SolicitacoesPage from './screens/solicitacoes/SolicitacoesPage';
import SolicitacaoDetailPage from './screens/solicitacoes/SolicitacaoDetailPage';
import ClientPortalPage from './screens/client-portal/ClientPortalPage';

const ShellLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export default function App() {
  return (
    <Routes>
      <Route path="/s/:token" element={<ClientPortalPage />} />

      <Route element={<ShellLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:clienteId" element={<ClientDetailPage />} />
        <Route path="/documentos" element={<DocumentsPage />} />
        <Route path="/prazos" element={<DeadlinesPage />} />
        <Route path="/solicitacoes" element={<SolicitacoesPage />} />
        <Route path="/solicitacoes/:solicitacaoId" element={<SolicitacaoDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
