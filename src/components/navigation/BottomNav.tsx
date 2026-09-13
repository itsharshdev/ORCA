import React from 'react';
import { useOrca } from '../../context/OrcaContext';
import { Anchor, Map, Radio, Bell, MessageSquareQuote } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeAlerts } = useOrca();

  const unreadAlerts = activeAlerts.filter((a) => !a.acknowledged).length;

  return (
    <nav className="orca-bottom-nav">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Anchor size={20} />
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => setActiveTab('map')}
      >
        <Map size={20} />
        <span>Map</span>
      </button>

      <button
        className="nav-ask-orca-pill"
        onClick={() => setActiveTab('ask-orca')}
      >
        <MessageSquareQuote size={18} />
        <span>Ask ORCA</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'updates' ? 'active' : ''}`}
        onClick={() => setActiveTab('updates')}
      >
        <Radio size={20} />
        <span>Updates</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={() => setActiveTab('alerts')}
      >
        <Bell size={20} />
        <span>Alerts</span>
        {unreadAlerts > 0 && <div className="nav-badge">{unreadAlerts}</div>}
      </button>
    </nav>
  );
};
