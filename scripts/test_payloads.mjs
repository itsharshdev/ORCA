const BACKEND_URL = 'http://localhost:3001/api/v1';

async function testPayloads() {
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
  console.log('/orca/query response keys:', Object.keys(qData));
  console.log('decision:', qData.decision);
  console.log('llmReasoning:', qData.llmReasoning);

  const scRes = await fetch(`${BACKEND_URL}/scenarios/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baselineQueryId: qData.queryId,
      naturalLanguageScenario: "What if wave height increases to 2.5 metres?",
      modifications: {
        assumptions: { waveHeightMeters: 2.5 }
      }
    })
  });
  const scData = await scRes.json();
  console.log('/scenarios/evaluate response keys:', Object.keys(scData));
  console.log('scenario evaluation details:', JSON.stringify(scData, null, 2).substring(0, 500));
}

testPayloads();
