import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegionProvider } from '@/context/RegionContext';
import { OrchestrationProvider } from '@/context/OrchestrationContext';
import { RoleProvider } from '@/context/RoleContext';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FishermanHomePage } from '@/pages/fisherman/FishermanHomePage';
import { AskOrcaPage } from '@/pages/AskOrcaPage';
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
              {/* Public Marketing & Information Routes */}
              <Route path={ROUTES.HOME} element={<LandingPage />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
              <Route path={ROUTES.CONTACT} element={<ContactPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />

              {/* Authenticated Tidal Light Application Shell Routes */}
              <Route element={<AppShell />}>
                {/* Primary Fisherman Experience */}
                <Route path={ROUTES.DASHBOARD} element={<FishermanHomePage />} />
                
                {/* Core Operational Decision Modules */}
                <Route path={ROUTES.ASK} element={<AskOrcaPage />} />
                <Route path={ROUTES.MISSION} element={<MissionPlannerPage />} />
                <Route path={ROUTES.MAP} element={<MarineMapPage />} />
                <Route path={ROUTES.DECISIONS} element={<DecisionsPage />} />
                <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
                <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

                {/* Institutional Role Workspaces */}
                <Route path={ROUTES.AUTHORITY} element={<AuthorityDashboardPage />} />
                <Route path={ROUTES.DISASTER} element={<DisasterManagementPage />} />
                <Route path={ROUTES.RESEARCH} element={<ResearcherDashboardPage />} />
                <Route path={ROUTES.RESEARCHER} element={<ResearcherDashboardPage />} />
                <Route path={ROUTES.OPERATOR} element={<OperatorDashboardPage />} />
              </Route>

              {/* Default & Fallback: Redirect to /dashboard */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </OrchestrationProvider>
    </RegionProvider>
  );
};

export default App;

