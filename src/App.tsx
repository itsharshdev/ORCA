import React from 'react';
import { OrcaProvider, useOrca } from './context/OrcaContext';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';

import { HomeView } from './components/views/HomeView';
import { AskOrcaView } from './components/views/AskOrcaView';
import { MapView } from './components/views/MapView';
import { UpdatesView } from './components/views/UpdatesView';
import { AlertsView } from './components/views/AlertsView';
import { TripPlannerView } from './components/views/TripPlannerView';

import { WhatIfSimulatorModal } from './components/modals/WhatIfSimulatorModal';
import { DecisionDetailsModal } from './components/modals/DecisionDetailsModal';
import { VesselProfileModal } from './components/modals/VesselProfileModal';

import './styles/index.css';

const AppContent: React.FC = () => {
  const { activeTab, isTripPlannerOpen } = useOrca();

  return (
    <>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'ask-orca' && <AskOrcaView />}
        {activeTab === 'updates' && <UpdatesView />}
        {activeTab === 'alerts' && <AlertsView />}
      </main>

      <BottomNav />

      {/* Modals & Overlays */}
      {isTripPlannerOpen && <TripPlannerView />}
      <WhatIfSimulatorModal />
      <DecisionDetailsModal />
      <VesselProfileModal />
    </>
  );
};

export default function App() {
  return (
    <OrcaProvider>
      <AppContent />
    </OrcaProvider>
  );
}
