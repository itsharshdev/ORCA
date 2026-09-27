import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegionProvider } from '@/context/RegionContext';
import { OrchestrationProvider } from '@/context/OrchestrationContext';
import { RoleProvider } from '@/context/RoleContext';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { CommandCenterPage } from '@/pages/CommandCenterPage';
import { FishermanHomePage } from '@/pages/fisherman/FishermanHomePage';
import { AuthorityDashboardPage } from '@/pages/authority/AuthorityDashboardPage';
import { DisasterManagementPage } from '@/pages/disaster/DisasterManagementPage';
import { ResearcherDashboardPage } from '@/pages/researcher/ResearcherDashboardPage';
import { OperatorDashboardPage } from '@/pages/operator/OperatorDashboardPage';
import { MissionPlannerPage } from '@/pages/MissionPlannerPage';
import { MarineMapPage } from '@/pages/MarineMapPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ROUTES } from '@/routes';

export const App: React.FC = () => {
  return (
    <RegionProvider>
      <OrchestrationProvider>
        <RoleProvider>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />

              {/* Authenticated Application Shell Routes */}
              <Route element={<AppShell />}>
                <Route path={ROUTES.DASHBOARD} element={<CommandCenterPage />} />
                <Route path={ROUTES.FISHERMAN} element={<FishermanHomePage />} />
                <Route path={ROUTES.AUTHORITY} element={<AuthorityDashboardPage />} />
                <Route path={ROUTES.DISASTER} element={<DisasterManagementPage />} />
                <Route path={ROUTES.RESEARCHER} element={<ResearcherDashboardPage />} />
                <Route path={ROUTES.OPERATOR} element={<OperatorDashboardPage />} />

                {/* Shared Navigation Modules */}
                <Route path={ROUTES.MISSION} element={<MissionPlannerPage />} />
                <Route path={ROUTES.MAP} element={<MarineMapPage />} />
                <Route path={ROUTES.DECISIONS} element={<DecisionsPage />} />
                <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
                <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              </Route>

              {/* Default & Fallback: Redirect to Command Center */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </OrchestrationProvider>
    </RegionProvider>
  );
};

export default App;
