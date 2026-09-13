import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { MOCK_NEWS_ADVISORIES } from '../../data/mockData';
import { Radio, AlertTriangle, Compass, Shield, Clock } from 'lucide-react';

export const UpdatesView: React.FC = () => {
  const { setSelectedSector, setActiveTab } = useOrca();

  return (
    <div className="view-content">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={22} color="var(--accent-blue)" />
          Marine Change Radar & Advisories
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Real-time updates from INCOIS, IMD Radar, Coast Guard & Harbor Control.
        </p>
      </div>

      {MOCK_NEWS_ADVISORIES.map((news) => (
        <div key={news.id} className="orca-card">
          <div className="orca-card-header">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              {news.source}
            </span>
            <span
              className={`badge ${
                news.isUrgent ? 'badge-danger' : news.type === 'PFZ_BULLETIN' ? 'badge-safe' : 'badge-info'
              }`}
            >
              {news.badge}
            </span>
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
            {news.title}
          </h2>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
            {news.summary}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {news.timestamp}
            </span>

            {news.type === 'PFZ_BULLETIN' && (
              <button
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => {
                  setSelectedSector(null);
                  setActiveTab('map');
                }}
              >
                <Compass size={13} />
                <span>Plot on Map</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
