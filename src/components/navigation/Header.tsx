import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { User, Volume2, VolumeX, ShieldCheck, Wifi, SignalHigh, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    vessel,
    connectivity,
    language,
    setLanguage,
    setIsProfileModalOpen,
    isSpeaking,
    speakDecision,
    stopSpeaking
  } = useOrca();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header className="orca-header">
        <div className="orca-logo-badge">
          <div className="orca-logo-icon">▲</div>
          <div>
            <div className="orca-logo-title">ORCA</div>
            <div className="orca-vessel-subtitle">{vessel.name} ({vessel.registrationNumber.slice(0, 10)})</div>
          </div>
        </div>

        <div className="orca-header-actions">
          <button
            className="lang-btn"
            onClick={() => {
              const idx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === language);
              const nextLang = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
              setLanguage(nextLang.code);
            }}
            title="Switch Language"
          >
            {currentLang.nativeName} / ENG
          </button>

          <button
            className="lang-btn"
            onClick={() => (isSpeaking ? stopSpeaking() : speakDecision())}
            title="Voice Assist"
            style={{ padding: '6px 8px' }}
          >
            {isSpeaking ? <VolumeX size={14} color="#dc2626" /> : <Volume2 size={14} color="#0284c7" />}
          </button>

          <div className="profile-avatar" onClick={() => setIsProfileModalOpen(true)} title="Vessel & Profile">
            <User size={16} />
          </div>
        </div>
      </header>

      <div className={`connectivity-banner ${connectivity}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {connectivity === 'CONNECTED' && <Wifi size={13} />}
          {connectivity === 'DEGRADED' && <SignalHigh size={13} />}
          {connectivity === 'OFFLINE' && <WifiOff size={13} />}
          <span>
            {connectivity === 'CONNECTED' && 'Connected (4G/5G Satellite Gateway)'}
            {connectivity === 'DEGRADED' && 'Degraded Link (DAT-SG / LoRa Active)'}
            {connectivity === 'OFFLINE' && 'Offline Mode (Local Cached Maps & Advisory Rules Active)'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={13} />
          <span>GPS Active (10m)</span>
        </div>
      </div>
    </>
  );
};
