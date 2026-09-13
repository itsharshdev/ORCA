import React, { useState } from 'react';
import { useOrca } from '../../context/OrcaContext';
import { MOCK_PFZ_SECTORS } from '../../data/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock, ShieldCheck, Compass, SlidersHorizontal } from 'lucide-react';

const vesselIcon = L.divIcon({
  className: 'vessel-marker',
  html: `<div style="background:#0f172a; color:#38bdf8; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:bold;">▲</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export const MapView: React.FC = () => {
  const {
    vessel,
    selectedSector,
    setIsTripPlannerOpen,
    setIsWhatIfModalOpen,
    setIsDecisionDetailsModalOpen
  } = useOrca();

  const [activeLayer, setActiveLayer] = useState<'all' | 'pfz' | 'weather' | 'boundaries'>('all');

  const currentSector = selectedSector || MOCK_PFZ_SECTORS[0];

  const vesselPos: [number, number] = [vessel.lat, vessel.lng];
  const sectorPos: [number, number] = [currentSector.lat, currentSector.lng];

  const safeCorridorRoute: [number, number][] = [
    vesselPos,
    [9.2600, 79.3500],
    sectorPos
  ];

  const imblBoundaryPoly: [number, number][] = [
    [9.4000, 79.4500],
    [9.2500, 79.4200],
    [9.1000, 79.3800]
  ];

  const pfzPolygon: [number, number][] = [
    [currentSector.lat + 0.02, currentSector.lng - 0.02],
    [currentSector.lat + 0.03, currentSector.lng + 0.03],
    [currentSector.lat - 0.02, currentSector.lng + 0.04],
    [currentSector.lat - 0.03, currentSector.lng - 0.01]
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
      {/* Coordinates & Header Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
            Gulf of Mannar
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            09°17.22&apos; N, 79°18.05&apos; E
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge-info" style={{ fontSize: 10, padding: '3px 8px' }}>
            <ShieldCheck size={12} />
            Sagarika - Active
          </span>
        </div>
      </div>

      {/* Layer Switcher Controls Bar */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--bg-card-subtle)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          zIndex: 10
        }}
      >
        <button
          className={`btn-outline ${activeLayer === 'all' ? 'active' : ''}`}
          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 16 }}
          onClick={() => setActiveLayer('all')}
        >
          All Layers
        </button>
        <button
          className={`btn-outline ${activeLayer === 'pfz' ? 'active' : ''}`}
          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 16 }}
          onClick={() => setActiveLayer('pfz')}
        >
          PFZ Zones
        </button>
        <button
          className={`btn-outline ${activeLayer === 'weather' ? 'active' : ''}`}
          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 16 }}
          onClick={() => setActiveLayer('weather')}
        >
          Weather Vectors
        </button>
        <button
          className={`btn-outline ${activeLayer === 'boundaries' ? 'active' : ''}`}
          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 16 }}
          onClick={() => setActiveLayer('boundaries')}
        >
          EEZ Buffer (2.0 NM)
        </button>
      </div>

      {/* Interactive Map */}
      <div style={{ flex: 1, minHeight: 320, position: 'relative' }}>
        <MapContainer center={vesselPos} zoom={10} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Vessel Marker */}
          <Marker position={vesselPos} icon={vesselIcon}>
            <Popup>
              <strong>{vessel.name}</strong>
              <br />
              Speed: {vessel.cruiseSpeedKts} kts
              <br />
              Fuel: {vessel.fuelCurrentLiters}L / {vessel.fuelCapacityLiters}L
            </Popup>
          </Marker>

          {/* PFZ Sector Polygon */}
          {(activeLayer === 'all' || activeLayer === 'pfz') && (
            <Polygon
              positions={pfzPolygon}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#0284c7',
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '4 4'
              }}
            >
              <Popup>
                <strong>{currentSector.name}</strong>
                <br />
                Target: {currentSector.expectedSpecies.join(', ')}
                <br />
                Depth: {currentSector.depthMeters}
              </Popup>
            </Polygon>
          )}

          {/* Safe Corridor Route Line */}
          {(activeLayer === 'all' || activeLayer === 'pfz') && (
            <Polyline
              positions={safeCorridorRoute}
              pathOptions={{ color: '#059669', weight: 4, opacity: 0.85 }}
            />
          )}

          {/* IMBL Boundary Line & Buffer Zone */}
          {(activeLayer === 'all' || activeLayer === 'boundaries') && (
            <>
              <Polyline
                positions={imblBoundaryPoly}
                pathOptions={{ color: '#dc2626', weight: 3, dashArray: '6 4' }}
              />
              <Circle
                center={[9.2500, 79.4200]}
                radius={3704} // 2.0 NM in meters
                pathOptions={{ color: '#dc2626', fillColor: '#fee2e2', fillOpacity: 0.15, stroke: false }}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Map Legend Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            zIndex: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }}></span>
            Safe Corridor
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }}></span>
            IMBL Buffer
          </span>
          <span>Scale 1NM</span>
        </div>
      </div>

      {/* Floating Bottom Detail Sheet / Focus Card */}
      <div className="orca-card" style={{ margin: 12, borderTop: '4px solid var(--accent-blue)', boxShadow: '0 -4px 15px rgba(0,0,0,0.08)' }}>
        <div className="orca-card-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentSector.name}
            </h3>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {currentSector.zoneCode}
            </div>
          </div>
          <span className="badge badge-safe">Safe to fish until {currentSector.safeUntilTime}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0 14px 0' }}>
          {/* Row 1: Distance & ETA */}
          <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={14} color="var(--accent-blue)" />
            <div>
              <strong>Distance &amp; ETA:</strong> {currentSector.distanceNm} NM East (approx. {currentSector.etaMinutes} min)
            </div>
          </div>

          {/* Row 2: Depth & Species */}
          <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={14} color="var(--accent-blue)" />
            <div>
              <strong>Depth &amp; Expected Species:</strong> {currentSector.depthMeters} • {currentSector.expectedSpecies.join(' & ')}
            </div>
          </div>

          {/* Row 3: Return Window Indicator */}
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b' }}>
            <Clock size={14} color="#dc2626" />
            <div>
              <strong>Return Window:</strong> Must head back by {currentSector.safeUntilTime} for calm passage
            </div>
          </div>
        </div>

        {/* Evidence Link */}
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setIsDecisionDetailsModalOpen(true)}
          >
            View Ocean &amp; Satellite Evidence →
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
          <button className="btn-primary" onClick={() => setIsTripPlannerOpen(true)}>
            <Navigation size={15} />
            <span>Set Route to Sector</span>
          </button>
          <button className="btn-outline" onClick={() => setIsWhatIfModalOpen(true)}>
            <SlidersHorizontal size={14} />
            <span>What-If Catch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
