import React, { createContext, useContext, useState } from 'react';
import type {
  VesselProfile,
  ConnectivityState,
  SupportedLanguage,
  DecisionCardData,
  PfzSector,
  SafetyAlert,
  TripPlan,
  WhatIfParams
} from '../types/orca';
import {
  MOCK_VESSEL,
  MOCK_INITIAL_DECISION,
  MOCK_PFZ_SECTORS,
  MOCK_ALERTS
} from '../data/mockData';
import { OrcaDecisionEngine } from '../services/orcaEngine';
import { VoiceEngine } from '../services/voiceEngine';

interface OrcaContextType {
  activeTab: 'home' | 'map' | 'ask-orca' | 'updates' | 'alerts';
  setActiveTab: (tab: 'home' | 'map' | 'ask-orca' | 'updates' | 'alerts') => void;
  vessel: VesselProfile;
  setVessel: React.Dispatch<React.SetStateAction<VesselProfile>>;
  connectivity: ConnectivityState;
  setConnectivity: (conn: ConnectivityState) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  activeDecision: DecisionCardData;
  setActiveDecision: React.Dispatch<React.SetStateAction<DecisionCardData>>;
  selectedSector: PfzSector | null;
  setSelectedSector: React.Dispatch<React.SetStateAction<PfzSector | null>>;
  activeAlerts: SafetyAlert[];
  acknowledgeAlert: (alertId: string) => void;
  isWhatIfModalOpen: boolean;
  setIsWhatIfModalOpen: (open: boolean) => void;
  isDecisionDetailsModalOpen: boolean;
  setIsDecisionDetailsModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isTripPlannerOpen: boolean;
  setIsTripPlannerOpen: (open: boolean) => void;
  activeTrip: TripPlan | null;
  setActiveTrip: React.Dispatch<React.SetStateAction<TripPlan | null>>;
  chatHistory: Array<{ sender: 'user' | 'orca'; text: string; decision?: DecisionCardData; timestamp: string }>;
  askQuestion: (text: string) => void;
  runWhatIfSimulation: (params: WhatIfParams) => void;
  isSpeaking: boolean;
  speakDecision: (text?: string) => void;
  stopSpeaking: () => void;
}

const OrcaContext = createContext<OrcaContextType | undefined>(undefined);

export const OrcaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'ask-orca' | 'updates' | 'alerts'>('home');
  const [vessel, setVessel] = useState<VesselProfile>(MOCK_VESSEL);
  const [connectivity, setConnectivity] = useState<ConnectivityState>('CONNECTED');
  const [language, setLanguage] = useState<SupportedLanguage>('ta');
  const [activeDecision, setActiveDecision] = useState<DecisionCardData>(MOCK_INITIAL_DECISION);
  const [selectedSector, setSelectedSector] = useState<PfzSector | null>(MOCK_PFZ_SECTORS[0]);
  const [activeAlerts, setActiveAlerts] = useState<SafetyAlert[]>(MOCK_ALERTS);

  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isDecisionDetailsModalOpen, setIsDecisionDetailsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false);
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(null);

  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'orca'; text: string; decision?: DecisionCardData; timestamp: string }>
  >([
    {
      sender: 'user',
      text: 'Can I go fishing tomorrow morning?',
      timestamp: '05:40 IST'
    },
    {
      sender: 'orca',
      text: 'Morning fishing looks suitable. Conditions may worsen after 2:00 PM.',
      decision: MOCK_INITIAL_DECISION,
      timestamp: '05:45 IST'
    }
  ]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const askQuestion = (questionText: string) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const decision = OrcaDecisionEngine.evaluateQuestion(questionText, vessel, selectedSector || undefined);

    setActiveDecision(decision);
    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', text: questionText, timestamp: timeStr },
      { sender: 'orca', text: decision.headline, decision, timestamp: timeStr }
    ]);
  };

  const runWhatIfSimulation = (params: WhatIfParams) => {
    const updated = OrcaDecisionEngine.simulateWhatIf(activeDecision, params, vessel);
    setActiveDecision(updated);
  };

  const speakDecision = (textToSpeak?: string) => {
    const text = textToSpeak || `${activeDecision.headline}. ${activeDecision.narrative}`;
    setIsSpeaking(true);
    VoiceEngine.speak(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const stopSpeaking = () => {
    VoiceEngine.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <OrcaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        vessel,
        setVessel,
        connectivity,
        setConnectivity,
        language,
        setLanguage,
        activeDecision,
        setActiveDecision,
        selectedSector,
        setSelectedSector,
        activeAlerts,
        acknowledgeAlert,
        isWhatIfModalOpen,
        setIsWhatIfModalOpen,
        isDecisionDetailsModalOpen,
        setIsDecisionDetailsModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isTripPlannerOpen,
        setIsTripPlannerOpen,
        activeTrip,
        setActiveTrip,
        chatHistory,
        askQuestion,
        runWhatIfSimulation,
        isSpeaking,
        speakDecision,
        stopSpeaking
      }}
    >
      {children}
    </OrcaContext.Provider>
  );
};

export const useOrca = () => {
  const ctx = useContext(OrcaContext);
  if (!ctx) throw new Error('useOrca must be used within OrcaProvider');
  return ctx;
};
