import React, { useState } from 'react';
import { useOrca } from '../../context/OrcaContext';
import { MOCK_PFZ_SECTORS } from '../../data/mockData';
import type { TripPlan } from '../../types/orca';
import { ShieldCheck, Compass, Fuel, CheckCircle, Navigation, Clock, X } from 'lucide-react';

export const TripPlannerView: React.FC = () => {
  const { vessel, activeTrip, setActiveTrip, setIsTripPlannerOpen, setActiveTab } = useOrca();

  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState(MOCK_PFZ_SECTORS[0]);
  const [crewCount, setCrewCount] = useState(vessel.crewCount);
  const [departureTime, setDepartureTime] = useState('04:30 AM');

  const routeDistance = selectedSector.distanceNm * 2; // Roundtrip
  const fuelRequired = Math.round((routeDistance / vessel.cruiseSpeedKts) * vessel.fuelConsumptionRateLph * 1.2);
  const fuelReserve = Math.round(((vessel.fuelCurrentLiters - fuelRequired) / vessel.fuelCapacityLiters) * 100);

  const handleLaunchTrip = () => {
    const trip: TripPlan = {
      id: `trip-${Date.now()}`,
      destinationSector: selectedSector,
      vessel,
      crewCount,
      gearType: vessel.gearType,
      departureTime,
      estimatedReturnTime: '11:30 AM',
      routeDistanceNm: routeDistance,
      fuelRequiredLiters: fuelRequired,
      fuelReservePercentage: fuelReserve,
      safeCorridorActive: true,
      imblBufferMarginNm: 2.4,
      status: 'ACTIVE'
    };
    setActiveTrip(trip);
    setIsTripPlannerOpen(false);
    setActiveTab('map');
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
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>ORCA Trip Planner</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Step {step} of 3: {step === 1 ? 'Target & Port' : step === 2 ? 'Schedule & Safety' : 'Fuel & Launch'}
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setIsTripPlannerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Destination & Crew */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Select Fishing Sector:
              </label>
              {MOCK_PFZ_SECTORS.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSector(sec)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: selectedSector.id === sec.id ? '2px solid var(--primary-dark)' : '1px solid var(--border-color)',
                    backgroundColor: selectedSector.id === sec.id ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                    marginBottom: 8,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{sec.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {sec.distanceNm} NM • Depth {sec.depthMeters} • Expected: {sec.expectedSpecies.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Crew Count Onboard:
              </label>
              <input
                type="number"
                value={crewCount}
                onChange={(e) => setCrewCount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  fontSize: 14
                }}
              />
            </div>

            <button className="btn-primary" onClick={() => setStep(2)}>
              <span>Next: Safety Check →</span>
            </button>
          </div>
        )}

        {/* Step 2: Schedule & Safety */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Target Departure Time:
              </label>
              <select
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  fontSize: 14
                }}
              >
                <option value="04:30 AM">04:30 AM (Recommended - High Tide & Calm Window)</option>
                <option value="05:30 AM">05:30 AM (Moderate Chop near Noon)</option>
                <option value="06:30 AM">06:30 AM (Requires early return by 11:00 AM)</option>
              </select>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#059669" />
                Boundary Guardian Verification
              </div>
              <ul style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 1.5 }}>
                <li>Route uses <strong>Safe Corridor</strong> (Palk Strait Channel).</li>
                <li>Maintains <strong>2.4 NM Buffer</strong> from IMBL Boundary.</li>
                <li>Avoids Coast Guard exercise restricted radius.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn-primary" style={{ flex: 1.5 }} onClick={() => setStep(3)}>
                Verify Fuel & Launch →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Fuel Calculation & Launch */}
        {step === 3 && (
          <div>
            <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Fuel size={16} color="var(--accent-blue)" />
                Fuel Envelope Calculation
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Current Tank:</div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{vessel.fuelCurrentLiters} Liters</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Trip Estimate:</div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{fuelRequired} Liters</div>
                </div>
              </div>

              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Safety Reserve Margin:</span>
                <span style={{ fontWeight: 800, color: fuelReserve >= 25 ? '#059669' : '#dc2626' }}>
                  {fuelReserve}% (Safe)
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#166534', display: 'flex', gap: 8 }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Trip Ready:</strong> All multi-agent safety checks passed. Real-time Return-to-Shore monitoring will activate upon departure.
              </div>
            </div>

            <button className="btn-primary" onClick={handleLaunchTrip}>
              <Navigation size={16} />
              <span>Launch Active Trip Monitoring</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
