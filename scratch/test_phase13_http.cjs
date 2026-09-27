const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log('--- STARTING PHASE 13 LIVE HTTP VERIFICATION ---');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/health',
    method: 'GET',
    headers: { 'Origin': 'http://localhost:5173' }
  });
  console.log('1. Health Check:', health.status, health.body?.status, 'CORS:', health.headers['access-control-allow-origin']);

  // 2. Scenario GO: Safe mission
  const goPayload = {
    regionId: 'maharashtra',
    vesselId: 'VESSEL-001',
    departureTime: '05:45 IST',
    durationHours: 4,
    originLocation: { latitude: 18.75, longitude: 72.70 },
    waypoints: [{ latitude: 18.70, longitude: 72.65 }],
    targetZoneId: 'PFZ-MUM-01',
    environmentalContext: {
      waveHeightMeters: 1.1,
      windSpeedKnots: 10.0,
      seaSurfaceTemperatureCelsius: 28.0,
      currentSpeedKnots: 0.7,
      activeWarnings: [],
      observedAt: new Date().toISOString(),
      isLive: true
    }
  };

  const goRes = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    }
  }, goPayload);
  console.log('2. Scenario GO:', goRes.status, 'Verdict:', goRes.body?.verdict, 'Blocking:', goRes.body?.blockingFactors?.length, 'Rules:', goRes.body?.rules?.length);

  // 3. Scenario AVOID: Restricted Zone
  const avoidGisPayload = {
    regionId: 'maharashtra',
    vesselId: 'VESSEL-001',
    departureTime: '06:00 IST',
    durationHours: 4,
    originLocation: { latitude: 18.75, longitude: 72.70 },
    waypoints: [{ latitude: 18.93, longitude: 72.85 }], // Incurs into Naval Zone
    environmentalContext: {
      waveHeightMeters: 1.0,
      windSpeedKnots: 8.0,
      observedAt: new Date().toISOString(),
      isLive: true
    }
  };

  const avoidGisRes = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    }
  }, avoidGisPayload);
  console.log('3. Scenario AVOID (GIS):', avoidGisRes.status, 'Verdict:', avoidGisRes.body?.verdict, 'Driver:', avoidGisRes.body?.primaryDriver);

  // 4. Scenario AVOID: Vessel Wave limit failure
  const avoidVesselPayload = {
    regionId: 'maharashtra',
    vesselId: 'VESSEL-001', // Max wave 1.8m
    departureTime: '06:00 IST',
    durationHours: 4,
    originLocation: { latitude: 18.75, longitude: 72.70 },
    environmentalContext: {
      waveHeightMeters: 3.1, // Exceeds 1.8m
      windSpeedKnots: 10.0,
      observedAt: new Date().toISOString(),
      isLive: true
    }
  };

  const avoidVesselRes = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    }
  }, avoidVesselPayload);
  console.log('4. Scenario AVOID (Vessel):', avoidVesselRes.status, 'Verdict:', avoidVesselRes.body?.verdict, 'Driver:', avoidVesselRes.body?.primaryDriver);

  // 5. Scenario INSUFFICIENT_DATA: Missing wave and wind
  const insDataPayload = {
    regionId: 'maharashtra',
    vesselId: 'VESSEL-001',
    departureTime: '06:00 IST',
    durationHours: 4,
    originLocation: { latitude: 18.75, longitude: 72.70 },
    environmentalContext: {
      observedAt: new Date().toISOString(),
      isLive: false
    }
  };

  const insDataRes = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    }
  }, insDataPayload);
  console.log('5. Scenario INSUFFICIENT_DATA:', insDataRes.status, 'Verdict:', insDataRes.body?.verdict, 'Driver:', insDataRes.body?.primaryDriver);

  // 6. Scenario Determinism Repeat
  const rep1 = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, goPayload);

  const rep2 = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/decisions/evaluate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, goPayload);

  const isIdentical = rep1.body.verdict === rep2.body.verdict &&
    rep1.body.primaryDriver === rep2.body.primaryDriver &&
    JSON.stringify(rep1.body.rules) === JSON.stringify(rep2.body.rules);
  console.log('6. Scenario Determinism Repeat:', isIdentical ? 'PASS (100% Identical)' : 'FAIL');

  console.log('--- LIVE HTTP VERIFICATION COMPLETE ---');
}

runLiveVerification().catch(console.error);
