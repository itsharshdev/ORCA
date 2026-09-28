import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\02610232-b96f-4f15-ba69-017ef99b54ca\\scratch\\chrome_reality_audit';
const CDP_PORT = 9228;
const BASE_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3001/api/v1';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    this.consoleErrors = [];
    this.networkRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method) {
          if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            const errStr = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
            if (!errStr.includes('favicon.ico')) {
              this.consoleErrors.push(errStr);
            }
          } else if (msg.method === 'Network.requestWillBeSent') {
            this.networkRequests.push({
              url: msg.params.request.url,
              method: msg.params.request.method,
              timestamp: msg.params.timestamp
            });
          }
          const listeners = this.eventListeners.get(msg.method) || [];
          for (const fn of listeners) fn(msg.params);
        }
      };
    });
  }

  send(method, params = {}, sessionId = null) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('============================================================');
  console.log('ORCA COMPREHENSIVE PRODUCT REALITY AUDIT');
  console.log('============================================================\n');

  if (existsSync(USER_DATA_DIR)) {
    try {
      rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
  mkdirSync(USER_DATA_DIR, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,800',
    'about:blank',
  ]);

  await sleep(1500);

  try {
    const versionRes = await fetch(`http://localhost:${CDP_PORT}/json/version`);
    const versionData = await versionRes.json();
    const wsUrl = versionData.webSocketDebuggerUrl;

    const client = new CdpClient(wsUrl);
    await client.connect();
    console.log('✓ Connected to Chrome CDP on port', CDP_PORT);

    // Create target session
    const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });

    await client.send('Page.enable', {}, sessionId);
    await client.send('Runtime.enable', {}, sessionId);
    await client.send('Network.enable', {}, sessionId);

    async function evaluate(expression) {
      const res = await client.send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
      return res.result?.value;
    }

    async function navigateTo(path) {
      await client.send('Page.navigate', { url: `${BASE_URL}${path}` }, sessionId);
      await sleep(600);
    }

    // 1. Audit All Routes
    console.log('\n--- 1. AUDITING ALL ROUTES ---');
    const routes = [
      { path: '/', name: 'Landing Page' },
      { path: '/about', name: 'About Page' },
      { path: '/contact', name: 'Contact Page' },
      { path: '/login', name: 'Login & Role Switcher' },
      { path: '/dashboard', name: 'Fisherman Flagship Home' },
      { path: '/ask', name: 'Ask ORCA Decision Intelligence' },
      { path: '/mission', name: 'Redesigned Mission Planner' },
      { path: '/map', name: 'Tactical Marine Map' },
      { path: '/alerts', name: 'Operational Alert Center' },
      { path: '/decisions', name: '5-Level Decision Explainability' },
      { path: '/history', name: 'Historical Mission Replay' },
      { path: '/profile', name: 'User & Vessel Profile' },
      { path: '/settings', name: 'Application Settings' },
      { path: '/authority', name: 'Coastal Authority Desk' },
      { path: '/disaster', name: 'Disaster Management Desk' },
      { path: '/research', name: 'Oceanographic Researcher' },
      { path: '/operator', name: 'Fleet Dispatcher' }
    ];

    const routeAuditResults = [];
    for (const r of routes) {
      await navigateTo(r.path);
      const audit = await evaluate(`(() => {
        return {
          title: document.title,
          heading: document.querySelector('h1, h2')?.innerText || '',
          textLength: document.body.innerText.length,
          buttonsCount: document.querySelectorAll('button').length,
          linksCount: document.querySelectorAll('a').length,
          hasError: document.body.innerText.toLowerCase().includes('something went wrong') || document.body.innerText.toLowerCase().includes('cannot read properties'),
          pageTextSnippet: document.body.innerText.substring(0, 150).replace(/\\n/g, ' ')
        };
      })()`);
      routeAuditResults.push({ ...r, ...audit });
      console.log(`[ROUTE]: ${r.path.padEnd(14)} -> ${audit.heading.substring(0, 30)} | textLen: ${audit.textLength} | buttons: ${audit.buttonsCount}`);
    }

    // 2. Audit Ask ORCA Multi-Turn Queries
    console.log('\n--- 2. AUDITING ASK ORCA API & INTELLIGENCE ---');
    const queriesToTest = [
      { q: "Can I go fishing tomorrow morning near Alibaug?", type: "Standard Morning Trip" },
      { q: "What about departing at 14:00 IST for 4 hours?", type: "Afternoon Window Change" },
      { q: "What if wave height increases to 2.5 metres?", type: "What-If Wave Breach" },
      { q: "What if I switch vessel to Matsya Deep?", type: "Vessel Capability Change" },
      { q: "Why did ORCA decide CAUTION?", type: "Algorithmic Why Request" },
      { q: "Tell me a joke about whales", type: "Out-of-Domain Guardrail" }
    ];

    for (const item of queriesToTest) {
      const res = await fetch(`${BACKEND_URL}/orca/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.q, vesselId: 'VESSEL-001', location: { latitude: 18.64, longitude: 72.87 } })
      });
      const data = await res.json();
      console.log(`[QUERY]: "${item.q}"`);
      console.log(` -> Status: ${res.status} | Verdict: ${data.decision?.verdict || 'N/A'} | Intent: ${data.intent || 'N/A'} | Reasons: ${(data.decision?.reasons || []).join('; ')}`);
    }

    // 3. Audit Deterministic Safety Rules
    console.log('\n--- 3. AUDITING DETERMINISTIC SAFETY ENGINE ---');
    const safetyChecks = [
      {
        name: "Normal Moderate Conditions (1.2m wave, FRP boat)",
        payload: {
          vesselId: "VESSEL-001",
          departureTime: new Date(Date.now() + 3600000).toISOString(),
          durationHours: 4,
          coordinates: { latitude: 18.64, longitude: 72.87 }
        },
        expected: "GO"
      },
      {
        name: "Extreme Swell Breach (2.8m wave vs 1.8m limit)",
        payload: {
          vesselId: "VESSEL-001",
          departureTime: new Date(Date.now() + 3600000).toISOString(),
          durationHours: 4,
          coordinates: { latitude: 18.64, longitude: 72.87 },
          conditionsOverride: { significantWaveHeight: 2.8 }
        },
        expected: "AVOID"
      },
      {
        name: "Naval Restricted Zone Incursion (1.0km boundary)",
        payload: {
          vesselId: "VESSEL-001",
          departureTime: new Date(Date.now() + 3600000).toISOString(),
          durationHours: 4,
          coordinates: { latitude: 18.91, longitude: 72.81 } // Mumbai Naval Anchorage
        },
        expected: "AVOID"
      },
      {
        name: "Night Departure Sunset Violation (21:00 departure)",
        payload: {
          vesselId: "VESSEL-001",
          departureTime: new Date(Date.now() + 50400000).toISOString(), // late evening
          durationHours: 6,
          coordinates: { latitude: 18.64, longitude: 72.87 }
        },
        expected: "CAUTION/AVOID"
      }
    ];

    for (const sc of safetyChecks) {
      const res = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sc.payload)
      });
      const data = await res.json();
      console.log(`[SAFETY]: ${sc.name} -> Verdict: ${data.verdict || data.decision?.verdict} | Rules: ${(data.ruleEvaluations || []).map(r => r.ruleId + ':' + r.passed).join(', ')}`);
    }

    // 4. Audit What-If Scenario Re-evaluation Engine
    console.log('\n--- 4. AUDITING WHAT-IF SCENARIO ENGINE ---');
    const scenarioRes = await fetch(`${BACKEND_URL}/scenarios/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseline: {
          vesselId: "VESSEL-001",
          departureTime: "2026-09-28T06:00:00Z",
          durationHours: 5,
          location: { latitude: 18.64, longitude: 72.87, name: "Alibaug" }
        },
        scenario: {
          hypotheticalDepartureTime: "2026-09-28T14:00:00Z",
          hypotheticalDurationHours: 6,
          hypotheticalWaveHeight: 2.4
        }
      })
    });
    const scenarioData = await scenarioRes.json();
    console.log(`[WHAT-IF]: Baseline Verdict: ${scenarioData.baseline?.decision?.verdict} -> Scenario Verdict: ${scenarioData.scenario?.decision?.verdict}`);
    console.log(`[WHAT-IF DELTA]: ${scenarioData.explanation}`);

    // 5. Audit Alerts Engine & Progressive Disclosure
    console.log('\n--- 5. AUDITING ALERT PROGRESSIVE DISCLOSURE ---');
    const alertsRes = await fetch(`${BACKEND_URL}/alerts`);
    const alertsData = await alertsRes.json();
    console.log(`[ALERTS]: Active Alerts Count: ${(alertsData.alerts || []).length}`);
    if ((alertsData.alerts || []).length > 0) {
      const firstAlert = alertsData.alerts[0];
      const detailRes = await fetch(`${BACKEND_URL}/alerts/${firstAlert.id}`);
      const detailData = await detailRes.json();
      console.log(`[ALERT DETAIL]: ID: ${firstAlert.id} | Severity: ${firstAlert.severity} | Category: ${firstAlert.category}`);
      console.log(` -> Level 1 Action: ${detailData.alert?.actionDirective}`);
      console.log(` -> Level 3 Evidence Count: ${(detailData.evidence || []).length}`);
      console.log(` -> Level 4 Rule Trace Count: ${(detailData.ruleEvaluations || []).length}`);
    }

    // 6. Audit Data Source Statuses & Reality
    console.log('\n--- 6. AUDITING DATA ADAPTER TRUTH ---');
    const adapterRes = await fetch(`${BACKEND_URL}/adapters`);
    const adapterData = await adapterRes.json();
    for (const ad of adapterData.adapters || []) {
      console.log(`[ADAPTER]: ${ad.source.padEnd(16)} | Dataset: ${ad.dataset.padEnd(26)} | Type: ${ad.sourceType.padEnd(8)} | Status: ${ad.status}`);
    }

    console.log('\n============================================================');
    console.log('REALITY AUDIT DATA COLLECTION COMPLETE');
    console.log('============================================================');

    client.close();
  } finally {
    chromeProc.kill();
  }
}

main().catch(console.error);
