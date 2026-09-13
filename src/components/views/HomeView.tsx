import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { MOCK_NEWS_ADVISORIES, MOCK_WEATHER } from '../../data/mockData';
import { Info, MapPin, Compass, AlertTriangle, ArrowRight, Navigation, Sparkles } from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    activeDecision,
    setActiveTab,
    setIsDecisionDetailsModalOpen,
    setIsTripPlannerOpen,
    setSelectedSector
  } = useOrca();

  const pfzNews = MOCK_NEWS_ADVISORIES.find((n) => n.type === 'PFZ_BULLETIN');
  const navWarning = MOCK_NEWS_ADVISORIES.find((n) => n.type === 'COAST_GUARD');

  return (
    <div className="view-content">
      {/* 1. Main Current Decision Card */}
      <div className="orca-card" style={{ borderLeft: '4px solid #f59e0b' }}>
        <div className="orca-card-header">
          <span className="badge badge-caution">• {activeDecision.safetyLevel}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {activeDecision.timestamp}
          </span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, color: 'var(--text-primary)' }}>
          {activeDecision.headline}
        </h2>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 500 }}>
          {activeDecision.subtext}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8 }}>
          <button className="btn-outline" onClick={() => setIsDecisionDetailsModalOpen(true)}>
            <Info size={14} />
            <span>Why? Details</span>
          </button>
          <button className="btn-outline" onClick={() => setActiveTab('map')}>
            <Compass size={14} />
            <span>View on Map</span>
          </button>
          <button className="btn-primary" onClick={() => setIsTripPlannerOpen(true)}>
            <Navigation size={14} />
            <span>Plan Trip</span>
          </button>
        </div>
      </div>

      {/* 2. Local Waters & Safe Corridor Card */}
      <div className="orca-card">
        <div className="orca-card-header">
          <span className="orca-card-title">Local Waters &amp; Safe Corridor</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Palk Bay / Dhanushkodi</span>
        </div>

        <div className="map-card-wrapper" style={{ marginBottom: 12 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 220" style={{ background: '#e0f2fe' }}>
            {/* Land contour */}
            <path d="M 0 0 L 140 0 L 180 80 L 120 160 L 0 220 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
            <text x="30" y="50" fontSize="11" fontWeight="700" fill="#64748b">Rameswaram</text>
            <text x="30" y="120" fontSize="10" fontWeight="600" fill="#64748b">Mandapam Jetty</text>

            {/* PFZ Sector polygon */}
            <path d="M 220 50 Q 280 40 320 90 Q 300 150 240 130 Z" fill="rgba(2, 132, 199, 0.15)" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="235" y="85" fontSize="10" fontWeight="700" fill="#0369a1">PFZ Sector Alpha</text>

            {/* Safe Corridor Line */}
            <path d="M 120 150 C 160 140, 200 110, 250 90" fill="none" stroke="#059669" strokeWidth="3" />

            {/* IMBL Boundary Red Buffer Line */}
            <line x1="360" y1="0" x2="360" y2="220" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 3" />
            <text x="310" y="30" fontSize="9" fontWeight="700" fill="#dc2626">IMBL 2.0 NM Buffer</text>

            {/* Vessel Position Pin */}
            <g transform="translate(180, 115)">
              <circle r="8" fill="#0f172a" />
              <circle r="4" fill="#38bdf8" />
              <rect x="-45" y="12" width="90" height="18" rx="4" fill="#0f172a" />
              <text x="0" y="24" fontSize="9" fontWeight="700" fill="white" textAnchor="middle">Sagarika Position</text>
            </g>

            {/* Active Safe Corridor Tag */}
            <g transform="translate(12, 12)">
              <rect width="125" height="22" rx="11" fill="white" stroke="#e2e8f0" />
              <circle cx="12" cy="11" r="3" fill="#10b981" />
              <text x="22" y="15" fontSize="10" fontWeight="700" fill="#047857">Active Safe Corridor</text>
            </g>
          </svg>
        </div>

        <button className="btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('map')}>
          <MapPin size={14} />
          <span>Open Interactive Marine Chart</span>
        </button>
      </div>

      {/* 3. Current Conditions Summary */}
      <div className="orca-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div>
          <div className="orca-card-title" style={{ marginBottom: 2 }}>Current Conditions</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {MOCK_WEATHER.windSpeedKts} kts {MOCK_WEATHER.windDirection} wind • {MOCK_WEATHER.waveHeightMeters}m wave
          </div>
        </div>
        <button
          className="btn-outline"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={() => setIsDecisionDetailsModalOpen(true)}
        >
          <span>Details</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 4. INCOIS Fishing Advisory Card */}
      {pfzNews && (
        <div className="orca-card">
          <div className="orca-card-header">
            <span className="orca-card-title">INCOIS Fishing Advisory</span>
            <span className="badge badge-safe">{pfzNews.badge}</span>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
            {pfzNews.title}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {pfzNews.summary}
          </p>
          <button
            className="btn-outline"
            style={{ width: '100%' }}
            onClick={() => {
              setSelectedSector(null);
              setActiveTab('map');
            }}
          >
            <Compass size={14} />
            <span>View Fishing Zone on Map</span>
          </button>
        </div>
      )}

      {/* 5. Navigational Warning Banner */}
      {navWarning && (
        <div
          className="orca-card"
          style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b'
          }}
        >
          <div className="orca-card-header" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} />
              NAVIGATIONAL WARNING
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#991b1b' }}>04:30 Notice</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
            {navWarning.summary}
          </p>
        </div>
      )}

      {/* Quick Ask Orca Trigger */}
      <div
        className="orca-card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setActiveTab('ask-orca')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 8 }}>
            <Sparkles size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Have a marine question?</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Ask ORCA about safety, weather and catch windows</div>
          </div>
        </div>
        <ArrowRight size={16} />
      </div>
    </div>
  );
};
