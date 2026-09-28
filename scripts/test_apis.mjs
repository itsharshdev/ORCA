const BACKEND_URL = 'http://localhost:3001/api/v1';

async function testApi() {
  console.log('Testing /orca/query...');
  const qRes = await fetch(`${BACKEND_URL}/orca/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queryText: "Can I go fishing tomorrow morning near Alibaug?",
      regionId: "maharashtra",
      operatorLocation: { latitude: 18.64, longitude: 72.87 }
    })
  });
  const qData = await qRes.json();
  console.log('Query result status:', qRes.status);
  console.log('Verdict:', qData.decision?.verdict);
  console.log('Confidence:', qData.decision?.confidenceScore);
  console.log('Explanation:', qData.explanation);
  console.log('Query ID:', qData.queryId);

  const baselineId = qData.queryId;

  console.log('\nTesting /scenarios/evaluate...');
  const scRes = await fetch(`${BACKEND_URL}/scenarios/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baselineQueryId: baselineId,
      naturalLanguageScenario: "What if wave height increases to 2.5 metres?",
      modifications: {
        assumptions: { waveHeightMeters: 2.5 }
      }
    })
  });
  const scData = await scRes.json();
  console.log('Scenario status:', scRes.status);
  console.log('Baseline Verdict:', scData.baseline?.decision?.verdict);
  console.log('Scenario Verdict:', scData.scenario?.decision?.verdict);
  console.log('Delta Explanation:', scData.explanation);

  console.log('\nTesting /decisions/evaluate (Normal)...');
  const dRes = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vesselId: "VESSEL-001",
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      durationHours: 4,
      originLocation: { latitude: 18.64, longitude: 72.87 },
      environmentalContext: {
        waveHeightMeters: 1.1,
        windSpeedKnots: 10,
        seaSurfaceTemperatureCelsius: 28
      }
    })
  });
  const dData = await dRes.json();
  console.log('Decision status:', dRes.status);
  console.log('Decision verdict:', dData.decision?.verdict || dData.verdict);
  console.log('Reasons:', dData.decision?.reasons || dData.reasons);
  console.log('Passed rules:', (dData.ruleEvaluations || []).filter(r => r.passed).map(r => r.ruleId));
  console.log('Failed rules:', (dData.ruleEvaluations || []).filter(r => !r.passed).map(r => r.ruleId));

  console.log('\nTesting /decisions/evaluate (High Wave Breach 2.8m)...');
  const dRes2 = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vesselId: "VESSEL-001", // FRP boat limit 1.8m
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      durationHours: 4,
      originLocation: { latitude: 18.64, longitude: 72.87 },
      environmentalContext: {
        waveHeightMeters: 2.8,
        windSpeedKnots: 22
      }
    })
  });
  const dData2 = await dRes2.json();
  console.log('High Wave Decision verdict:', dData2.decision?.verdict || dData2.verdict);
  console.log('Reasons:', dData2.decision?.reasons || dData2.reasons);
  console.log('Failed rules:', (dData2.ruleEvaluations || []).filter(r => !r.passed).map(r => r.ruleId));
}

testApi();
