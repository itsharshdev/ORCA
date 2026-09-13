import React, { useState } from 'react';
import { useOrca } from '../../context/OrcaContext';
import { Sliders, Clock, Wind, Gauge, Fuel, X, RefreshCw, AlertTriangle } from 'lucide-react';

export const WhatIfSimulatorModal: React.FC = () => {
  const {
    isWhatIfModalOpen,
    setIsWhatIfModalOpen,
    activeDecision,
    runWhatIfSimulation,
    vessel
  } = useOrca();

  const [delay, setDelay] = useState(0);
  const [windOffset, setWindOffset] = useState(0);
  const [enginePower, setEnginePower] = useState(100);
  const [fuelLevel, setFuelLevel] = useState(Math.round((vessel.fuelCurrentLiters / vessel.fuelCapacityLiters) * 100));

  if (!isWhatIfModalOpen) return null;

  const handleApply = () => {
    runWhatIfSimulation({
      departureDelayHours: delay,
      windSpeedOffsetKts: windOffset,
      enginePowerPercent: enginePower,
      fuelLevelPercent: fuelLevel,
      stayDurationHours: 4
    });
    setIsWhatIfModalOpen(false);
  };

  const handleReset = () => {
    setDelay(0);
    setWindOffset(0);
    setEnginePower(100);
    setFuelLevel(Math.round((vessel.fuelCurrentLiters / vessel.fuelCapacityLiters) * 100));
  };

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
            <Sliders size={20} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>What-If Scenario Simulator</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Test mission variables & live safety impact</div>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setIsWhatIfModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {/* Departure Delay Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="var(--text-secondary)" />
                Departure Delay:
              </span>
              <span style={{ color: delay > 0 ? '#d97706' : 'var(--text-primary)' }}>
                {delay === 0 ? 'On Time (04:30 AM)' : `+${delay} Hours (${4 + delay}:30 AM)`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Wind Speed Offset Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wind size={14} color="var(--text-secondary)" />
                Wind Speed Increase:
              </span>
              <span style={{ color: windOffset > 0 ? '#dc2626' : 'var(--text-primary)' }}>
                {activeDecision.windSpeedKts + windOffset} kts ({windOffset >= 0 ? `+${windOffset}` : windOffset} kts)
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="15"
              step="1"
              value={windOffset}
              onChange={(e) => setWindOffset(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Engine Power Percent Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gauge size={14} color="var(--text-secondary)" />
                Engine Throttle / Power:
              </span>
              <span>{enginePower}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="10"
              value={enginePower}
              onChange={(e) => setEnginePower(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Fuel Level Percent Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Fuel size={14} color="var(--text-secondary)" />
                Current Fuel Tank Level:
              </span>
              <span style={{ color: fuelLevel < 40 ? '#dc2626' : 'var(--text-primary)' }}>
                {fuelLevel}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={fuelLevel}
              onChange={(e) => setFuelLevel(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={handleReset}>
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
          <button className="btn-primary" style={{ flex: 1.5 }} onClick={handleApply}>
            <span>Recalculate Decision →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
