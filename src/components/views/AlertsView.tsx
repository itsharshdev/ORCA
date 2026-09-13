import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { Bell, ShieldAlert, CheckCircle2, Navigation, AlertTriangle, Compass } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { activeAlerts, acknowledgeAlert, setActiveTab, setIsTripPlannerOpen } = useOrca();

  return (
    <div className="view-content">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={22} color="#dc2626" />
          Safety Alerts & Guardian Center
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Active boundary geofences, weather return windows, and safety advisories.
        </p>
      </div>

      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className="orca-card"
          style={{
            borderLeft: `4px solid ${
              alert.severity === 'CRITICAL' ? '#dc2626' : alert.severity === 'WARNING' ? '#f59e0b' : '#0284c7'
            }`,
            opacity: alert.acknowledged ? 0.75 : 1
          }}
        >
          <div className="orca-card-header">
            <span
              className={`badge ${
                alert.severity === 'CRITICAL'
                  ? 'badge-danger'
                  : alert.severity === 'WARNING'
                  ? 'badge-caution'
                  : 'badge-info'
              }`}
            >
              {alert.type.replace('_', ' ')}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alert.timestamp}</span>
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
            {alert.title}
          </h2>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
            {alert.message}
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              padding: 10,
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 12,
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}
          >
            <strong>Recommended Action:</strong> {alert.recommendedAction}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!alert.acknowledged ? (
              <button
                className="btn-outline"
                style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
                onClick={() => acknowledgeAlert(alert.id)}
              >
                <CheckCircle2 size={14} color="#059669" />
                <span>Acknowledge Alert</span>
              </button>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> Acknowledged
              </span>
            )}

            <button
              className="btn-primary"
              style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
              onClick={() => setActiveTab('map')}
            >
              <Compass size={14} />
              <span>Plot Safe Route</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
