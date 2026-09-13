import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { ShieldCheck, Cpu, Database, AlertCircle, X, CheckCircle } from 'lucide-react';

export const DecisionDetailsModal: React.FC = () => {
  const { isDecisionDetailsModalOpen, setIsDecisionDetailsModalOpen, activeDecision } = useOrca();

  if (!isDecisionDetailsModalOpen) return null;

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
          maxWidth: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 0,
          borderRadius: 16
        }}
      >
        {/* Header */}
        <div className="orca-card-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Decision Evidence & Trust Trace</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-Agent Verification & Telemetry Audit</div>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setIsDecisionDetailsModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Overall Confidence Meter */}
        <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
            <span>Evidence Confidence Meter:</span>
            <span style={{ color: '#059669', fontWeight: 800 }}>{activeDecision.confidenceScore}% (High Quality)</span>
          </div>
          <div style={{ background: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${activeDecision.confidenceScore}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #10b981)'
              }}
            />
          </div>
        </div>

        {/* Multi-Agent Trace Breakdown */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} /> Multi-Agent Execution Trace
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeDecision.agentTraces.map((agent, idx) => (
              <div
                key={idx}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 2 }}>
                  <span style={{ color: 'var(--primary-dark)' }}>{agent.agentName}</span>
                  <span style={{ color: agent.status === 'COMPLETED' ? '#059669' : '#d97706', fontSize: 11 }}>
                    {agent.confidenceScore}% Match
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>
                  {agent.role}
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {agent.summary}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Source Conflict Resolution */}
        {activeDecision.crossSourceConflicts && activeDecision.crossSourceConflicts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} color="#dc2626" /> Cross-Source Conflict Reconciliation
            </div>
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, fontSize: 12, color: '#991b1b', lineHeight: 1.4 }}>
              {activeDecision.crossSourceConflicts[0]}
            </div>
          </div>
        )}

        {/* Telemetry Sources */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={14} /> Verified Satellite & Sensor Sources
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {activeDecision.telemetrySources.map((src, idx) => (
              <span key={idx} className="badge badge-info" style={{ textTransform: 'none' }}>
                <CheckCircle size={10} /> {src}
              </span>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => setIsDecisionDetailsModalOpen(false)}>
          <span>Close Audit Panel</span>
        </button>
      </div>
    </div>
  );
};
