import React, { useState } from 'react';
import { useOrca } from '../../context/OrcaContext';
import { SUGGESTED_QUERIES } from '../../data/mockData';
import { VoiceEngine } from '../../services/voiceEngine';
import {
  Mic,
  Send,
  AlertTriangle,
  Compass,
  Navigation,
  ChevronDown,
  ChevronUp,
  Clock,
  MicOff
} from 'lucide-react';

export const AskOrcaView: React.FC = () => {
  const {
    activeDecision,
    askQuestion,
    setActiveTab,
    setIsTripPlannerOpen,
    setIsWhatIfModalOpen,
    setIsDecisionDetailsModalOpen,
    language
  } = useOrca();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const handleSend = () => {
    if (!inputQuery.trim()) return;
    askQuestion(inputQuery);
    setInputQuery('');
  };

  const handleMicClick = () => {
    if (isListening) {
      VoiceEngine.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      VoiceEngine.startListening(
        language,
        (transcript) => {
          setInputQuery(transcript);
          setIsListening(false);
          askQuestion(transcript);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="view-content">
      {/* Greeting Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Good morning, Captain.
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          What would you like to know today?
        </p>
      </div>

      {/* Query Search Input Bar */}
      <div className="orca-card" style={{ padding: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Can I go fishing tomorrow..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '10px 12px',
              fontSize: 14,
              color: 'var(--text-primary)',
              background: 'transparent'
            }}
          />

          <button
            onClick={handleMicClick}
            style={{
              backgroundColor: isListening ? '#fee2e2' : 'var(--accent-blue-light)',
              color: isListening ? '#dc2626' : 'var(--accent-blue)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            <span>{isListening ? 'Listening...' : 'Speak'}</span>
          </button>

          <button
            onClick={handleSend}
            style={{
              backgroundColor: 'var(--primary-dark)',
              color: 'white',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Suggested Queries Chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          Suggested queries:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              className="btn-outline"
              style={{
                justifyContent: 'space-between',
                padding: '10px 14px',
                textAlign: 'left',
                backgroundColor: 'var(--bg-card)'
              }}
              onClick={() => askQuestion(q)}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>"{q}"</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Response & Decision Block */}
      <div className="orca-card" style={{ borderTop: '4px solid var(--primary-dark)' }}>
        <div className="orca-card-header">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Your Question
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            Tomorrow - Dhanushkodi
          </span>
        </div>

        {/* Decision Banner */}
        <div
          style={{
            backgroundColor: 'var(--badge-caution-bg)',
            border: '1px solid var(--badge-caution-border)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <AlertTriangle size={18} color="var(--badge-caution-text)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--badge-caution-text)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              DECISION
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--badge-caution-text)', marginTop: 2 }}>
              {activeDecision.safetyLevel} • Favorable early, return by 11:30 AM
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
          {activeDecision.narrative}
        </p>

        {/* TRIP SCHEDULE Timeline Pills */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            TRIP SCHEDULE
          </div>
          <div className="schedule-container">
            {activeDecision.schedule.map((st, idx) => (
              <div key={idx} className={`schedule-pill ${st.status}`}>
                <div className="schedule-time">{st.time}</div>
                <div className="schedule-label">{st.label}</div>
                <div className="schedule-sub">{st.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Telemetry Accordion */}
        <div style={{ marginBottom: 16 }}>
          <button
            className="accordion-toggle"
            onClick={() => setIsVerificationOpen(!isVerificationOpen)}
          >
            <span>View Verification & Telemetry (IMD Wind, INCOIS PFZ, IMBL Geofence)</span>
            {isVerificationOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isVerificationOpen && (
            <div
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                Multi-Agent Confidence Score: {activeDecision.confidenceScore}%
              </div>
              <ul style={{ paddingLeft: 16, marginBottom: 8 }}>
                {activeDecision.telemetrySources.map((src, idx) => (
                  <li key={idx}>{src} verified</li>
                ))}
              </ul>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={() => setIsDecisionDetailsModalOpen(true)}
              >
                Open Full Evidence Audit →
              </button>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-primary" onClick={() => setActiveTab('map')}>
            <Compass size={16} />
            <span>View Safe Route on Map</span>
          </button>

          <button className="btn-outline" style={{ width: '100%' }} onClick={() => setIsTripPlannerOpen(true)}>
            <Navigation size={15} />
            <span>Plan Trip with this Window</span>
          </button>
        </div>

        {/* Inline What-If Trigger Chip */}
        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'var(--bg-card-subtle)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--accent-blue)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onClick={() => setIsWhatIfModalOpen(true)}
        >
          <Clock size={14} />
          <span>Try What-If: "What if I leave at 03:00 AM instead?"</span>
        </div>
      </div>
    </div>
  );
};
