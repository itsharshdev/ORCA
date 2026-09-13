import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import type { ConnectivityState, SupportedLanguage } from '../../types/orca';
import { User, Ship, Globe, Radio, X, Check } from 'lucide-react';

export const VesselProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    vessel,
    connectivity,
    setConnectivity,
    language,
    setLanguage
  } = useOrca();

  if (!isProfileModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="orca-card"
        style={{
          width: '100%',
          maxWidth: 440,
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 0,
          borderRadius: 16
        }}
      >
        {/* Header */}
        <div className="orca-card-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={20} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Vessel & System Settings</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Profile, Regional Language & Connectivity</div>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setIsProfileModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Vessel Specifications */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ship size={14} /> Registered Vessel Specs
          </div>
          <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 12, borderRadius: 10, fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Vessel Name:</div>
              <div style={{ fontWeight: 800 }}>{vessel.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Registration:</div>
              <div style={{ fontWeight: 800 }}>{vessel.registrationNumber}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Craft Type:</div>
              <div style={{ fontWeight: 800 }}>{vessel.type}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Engine Power:</div>
              <div style={{ fontWeight: 800 }}>{vessel.engineHp} HP</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Home Port:</div>
              <div style={{ fontWeight: 800 }}>{vessel.homePort}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Fuel Tank:</div>
              <div style={{ fontWeight: 800 }}>{vessel.fuelCapacityLiters} Liters</div>
            </div>
          </div>
        </div>

        {/* Regional Language Switcher */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Globe size={14} /> Local Interface Language
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className="btn-outline"
                style={{
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: language === lang.code ? 'var(--bg-card-subtle)' : 'transparent',
                  borderColor: language === lang.code ? 'var(--primary-dark)' : 'var(--border-color)'
                }}
                onClick={() => setLanguage(lang.code as SupportedLanguage)}
              >
                <span>{lang.nativeName} ({lang.name})</span>
                {language === lang.code && <Check size={14} color="#059669" />}
              </button>
            ))}
          </div>
        </div>

        {/* Connectivity Gateway Simulator */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={14} /> Network Connectivity Mode
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['CONNECTED', 'DEGRADED', 'OFFLINE'] as ConnectivityState[]).map((mode) => (
              <button
                key={mode}
                className="btn-outline"
                style={{
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: connectivity === mode ? 'var(--bg-card-subtle)' : 'transparent',
                  borderColor: connectivity === mode ? 'var(--primary-dark)' : 'var(--border-color)'
                }}
                onClick={() => setConnectivity(mode)}
              >
                <div>
                  <div style={{ fontWeight: 800, textAlign: 'left' }}>
                    {mode === 'CONNECTED' && 'Connected (4G / 5G / Satellite)'}
                    {mode === 'DEGRADED' && 'Degraded (DAT-SG / LoRa Radio Link)'}
                    {mode === 'OFFLINE' && 'Offline (Cached Maps & Rules Only)'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'left' }}>
                    {mode === 'CONNECTED' && 'Real-time satellite & INCOIS radar feeds'}
                    {mode === 'DEGRADED' && 'Compressed text packets via DAT-SG terminal'}
                    {mode === 'OFFLINE' && 'Zero internet connection required'}
                  </div>
                </div>
                {connectivity === mode && <Check size={16} color="#059669" />}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => setIsProfileModalOpen(false)}>
          <span>Save & Close</span>
        </button>
      </div>
    </div>
  );
};
