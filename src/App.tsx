import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { CommandCenterPage } from '@/pages/CommandCenterPage';
import { MissionPlannerPage } from '@/pages/MissionPlannerPage';
import { MarineMapPage } from '@/pages/MarineMapPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ROUTES } from '@/routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Authenticated Application Shell Routes */}
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD} element={<CommandCenterPage />} />
          <Route path={ROUTES.MISSION} element={<MissionPlannerPage />} />
          <Route path={ROUTES.MAP} element={<MarineMapPage />} />
          <Route path={ROUTES.DECISIONS} element={<DecisionsPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Default & Fallback: Redirect to Command Center */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
