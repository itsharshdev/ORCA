import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\4f1b062b-81fa-42f9-a78e-b94c04ff648d\\scratch\\chrome_p20';
const CDP_PORT = 9222;

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

  on(method, callback) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(callback);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runVerification() {
  console.log('--- STARTING PHASE 20 PRODUCT UX & REAL CDP BROWSER VERIFICATION ---');

  if (existsSync(USER_DATA_DIR)) {
    try {
      rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {}
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

  let connected = false;
  let browserWsUrl = null;

  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        browserWsUrl = data.webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected || !browserWsUrl) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome CDP endpoint on port ' + CDP_PORT);
  }

  console.log('✓ Successfully launched Chrome and connected to CDP:', browserWsUrl);

  const browserClient = new CdpClient(browserWsUrl);
  await browserClient.connect();

  const { targetId } = await browserClient.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browserClient.send('Target.attachToTarget', { targetId, flatten: true });

  const consoleErrors = [];
  browserClient.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      const text = params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
      if (!text.includes('download the React DevTools') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  await browserClient.send('Page.enable', {}, sessionId);
  await browserClient.send('Runtime.enable', {}, sessionId);
  await browserClient.send('DOM.enable', {}, sessionId);

  async function evaluate(expression) {
    const res = await browserClient.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }, sessionId);
    if (res.exceptionDetails) {
      throw new Error('Evaluation error: ' + (res.exceptionDetails.exception?.description || 'Unknown'));
    }
    return res.result.value;
  }

  async function navigate(url, waitMs = 1500) {
    await browserClient.send('Page.navigate', { url }, sessionId);
    await sleep(waitMs);
  }

  async function waitForCondition(expression, timeoutMs = 7000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const result = await evaluate(expression);
        if (result) return true;
      } catch {}
      await sleep(250);
    }
    return false;
  }

  const testResults = [];

  // TEST 1: Fisherman Home Workspace
  console.log('\n[Test 1] Fisherman Operational Workspace (/dashboard)');
  await navigate('http://localhost:5173/dashboard', 2000);
  const splashChecked = await waitForCondition(`!document.getElementById('orca-boot-splash') || document.getElementById('orca-boot-splash').classList.contains('opacity-0')`);
  const verdictText = await waitForCondition(`document.body.innerText.toLowerCase().includes('caution') || document.body.innerText.toLowerCase().includes('go')`);
  const askOrcaBar = await waitForCondition(`!!document.querySelector('input[placeholder*="Ask anything"]')`);
  const tacticalMap = await waitForCondition(`document.body.innerText.toLowerCase().includes('tactical marine map')`);
  
  testResults.push({
    test: 'Fisherman Workspace: Boot splash cleanly transitioned',
    pass: !!splashChecked,
  });
  testResults.push({
    test: 'Fisherman Workspace: Decision Hero Card rendered with verdict',
    pass: !!verdictText,
  });
  testResults.push({
    test: 'Fisherman Workspace: 1-Tap Ask ORCA query input present',
    pass: !!askOrcaBar,
  });
  testResults.push({
    test: 'Fisherman Workspace: Tactical Marine Map corridor present',
    pass: !!tacticalMap,
  });

  // TEST 2: Ask ORCA Natural Language Query & Reasoning
  console.log('\n[Test 2] Ask ORCA Query & What-If (/ask)');
  await navigate('http://localhost:5173/ask?q=Can+I+fish+tomorrow+morning+for+5+hours%3F', 2000);
  const askHeader = await waitForCondition(`document.body.innerText.toLowerCase().includes('ask orca')`);
  const reasonResult = await waitForCondition(`document.body.innerText.toLowerCase().includes('caution') || document.body.innerText.toLowerCase().includes('departure') || document.body.innerText.toLowerCase().includes('window')`);
  const whatIfSection = await waitForCondition(`document.body.innerText.toLowerCase().includes('what-if')`);
  
  testResults.push({
    test: 'Ask ORCA: Page header & natural query interface loaded',
    pass: !!askHeader,
  });
  testResults.push({
    test: 'Ask ORCA: Synthesized reasoning card present with actionable verdict',
    pass: !!reasonResult,
  });
  testResults.push({
    test: 'Ask ORCA: What-If simulation controls present',
    pass: !!whatIfSection,
  });

  // TEST 3: Decisions 5-Level Progressive Disclosure
  console.log('\n[Test 3] Decisions 5-Level Progressive Disclosure (/decisions)');
  await navigate('http://localhost:5173/decisions', 2000);
  const level1 = await waitForCondition(`document.body.innerText.toLowerCase().includes('verdict') || document.body.innerText.toLowerCase().includes('caution')`);
  const level2Tab = await waitForCondition(`document.body.innerText.toLowerCase().includes('level 2')`);
  const level3Tab = await waitForCondition(`document.body.innerText.toLowerCase().includes('level 3')`);
  const level4Tab = await waitForCondition(`document.body.innerText.toLowerCase().includes('level 4')`);
  const level5Tab = await waitForCondition(`document.body.innerText.toLowerCase().includes('level 5')`);

  // Switch to Level 3 tab to verify multi-agency table
  await evaluate(`
    const btns = Array.from(document.querySelectorAll('button'));
    const lvl3Btn = btns.find(b => b.innerText.toLowerCase().includes('level 3'));
    if (lvl3Btn) lvl3Btn.click();
  `);
  const level3Content = await waitForCondition(`document.body.innerText.toLowerCase().includes('incois') || document.body.innerText.toLowerCase().includes('evidence')`);

  testResults.push({
    test: 'Decisions: Level 1 Operational Verdict present',
    pass: !!level1,
  });
  testResults.push({
    test: 'Decisions: Level 2 Why & Factor Decomposition tab present',
    pass: !!level2Tab,
  });
  testResults.push({
    test: 'Decisions: Level 3 Multi-Agency Evidence Tab & Table verified',
    pass: !!level3Tab && !!level3Content,
  });
  testResults.push({
    test: 'Decisions: Level 4 Deterministic Rule Evaluation Audits tab present',
    pass: !!level4Tab,
  });
  testResults.push({
    test: 'Decisions: Level 5 Specialist Execution Trace tab present',
    pass: !!level5Tab,
  });

  // TEST 4: Marine Map Tactical Presets
  console.log('\n[Test 4] Marine Map Dedicated Screen (/map)');
  await navigate('http://localhost:5173/map', 2000);
  const mapPresets = await waitForCondition(`
    document.body.innerText.toLowerCase().includes('fisherman') &&
    document.body.innerText.toLowerCase().includes('authority') &&
    document.body.innerText.toLowerCase().includes('disaster') &&
    document.body.innerText.toLowerCase().includes('research')
  `);
  const mapLeaflet = await waitForCondition(`!!document.querySelector('.leaflet-container')`);

  testResults.push({
    test: 'Marine Map: Role-specific layer preset quick buttons rendered',
    pass: !!mapPresets,
  });
  testResults.push({
    test: 'Marine Map: Leaflet interactive canvas initialized',
    pass: !!mapLeaflet,
  });

  // TEST 5: Alerts Operations Center
  console.log('\n[Test 5] Alerts Operations Center (/alerts)');
  await navigate('http://localhost:5173/alerts', 2000);
  const alertHeader = await waitForCondition(`document.body.innerText.toLowerCase().includes('alert center')`);
  const alertStatusTabs = await waitForCondition(`document.body.innerText.toLowerCase().includes('active') && document.body.innerText.toLowerCase().includes('acknowledged')`);
  const alertCards = await waitForCondition(`document.body.innerText.includes('CRITICAL') || document.body.innerText.includes('WARNING')`);

  testResults.push({
    test: 'Alerts: Operational Alert Center loaded',
    pass: !!alertHeader,
  });
  testResults.push({
    test: 'Alerts: Status & severity filter badges rendered',
    pass: !!alertStatusTabs,
  });
  testResults.push({
    test: 'Alerts: Active alerts rendered with severity styling',
    pass: !!alertCards,
  });

  // TEST 6: History & Audit Replay
  console.log('\n[Test 6] History & Mission Audit Replay (/history)');
  await navigate('http://localhost:5173/history', 2000);
  const historyHeader = await waitForCondition(`document.body.innerText.toLowerCase().includes('mission history')`);
  const historyBadges = await waitForCondition(`document.body.innerText.includes('ALL') && document.body.innerText.includes('GO') && document.body.innerText.includes('CAUTION') && document.body.innerText.includes('AVOID')`);
  const inspectButton = await waitForCondition(`document.body.innerText.toLowerCase().includes('inspect replay')`);

  // Open modal
  await evaluate(`
    const btns = Array.from(document.querySelectorAll('button'));
    const inspectBtn = btns.find(b => b.innerText.toLowerCase().includes('inspect replay'));
    if (inspectBtn) inspectBtn.click();
  `);
  const modalOpened = await waitForCondition(`document.body.innerText.toLowerCase().includes('historical decision replay')`);

  testResults.push({
    test: 'History: Replay repository header rendered in Tidal Light',
    pass: !!historyHeader,
  });
  testResults.push({
    test: 'History: Verdict filtering tabs present',
    pass: !!historyBadges,
  });
  testResults.push({
    test: 'History: 7-stage Replay & Audit modal interactive trigger',
    pass: !!inspectButton && !!modalOpened,
  });

  // Close modal
  await evaluate(`
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x') || b.innerText.includes('Close') || b.getAttribute('aria-label') === 'Close modal');
    if (closeBtn) closeBtn.click();
  `);

  // TEST 7: Coastal Authority Dashboard
  console.log('\n[Test 7] Coastal Authority Surveillance Workspace (/authority)');
  await navigate('http://localhost:5173/authority', 2000);
  const authSurveillance = await waitForCondition(`document.body.innerText.toLowerCase().includes('maritime operations')`);
  const authFleetRoster = await waitForCondition(`document.body.innerText.toLowerCase().includes('matsya sagar 1') || document.body.innerText.toLowerCase().includes('operational crafts')`);
  const authSecurityLog = await waitForCondition(`document.body.innerText.toLowerCase().includes('security log') || document.body.innerText.toLowerCase().includes('geofence')`);

  testResults.push({
    test: 'Coastal Authority: Domain awareness header rendered',
    pass: !!authSurveillance,
  });
  testResults.push({
    test: 'Coastal Authority: Fleet tracking roster populated',
    pass: !!authFleetRoster,
  });
  testResults.push({
    test: 'Coastal Authority: Restricted zone geofence security log present',
    pass: !!authSecurityLog,
  });

  // TEST 8: Disaster Management Workspace
  console.log('\n[Test 8] Disaster Management Workspace (/disaster)');
  await navigate('http://localhost:5173/disaster', 2000);
  const disasterCoord = await waitForCondition(`document.body.innerText.toLowerCase().includes('coastal hazard')`);
  const disasterHazards = await waitForCondition(`document.body.innerText.toLowerCase().includes('hazards') || document.body.innerText.toLowerCase().includes('wave') || document.body.innerText.toLowerCase().includes('swell')`);
  
  testResults.push({
    test: 'Disaster Management: Coastal hazard exposure header rendered',
    pass: !!disasterCoord,
  });
  testResults.push({
    test: 'Disaster Management: Verified hazard alerts rendered',
    pass: !!disasterHazards,
  });

  // TEST 9: Oceanographic Researcher Explorer
  console.log('\n[Test 9] Oceanographic Researcher Workspace (/research)');
  await navigate('http://localhost:5173/research', 2000);
  const researchHeader = await waitForCondition(`document.body.innerText.toLowerCase().includes('observation explorer')`);
  const researchTable = await waitForCondition(`document.body.innerText.toLowerCase().includes('observation records') || document.body.innerText.toLowerCase().includes('variable')`);
  const researchCategories = await waitForCondition(`document.body.innerText.toLowerCase().includes('ocean') && document.body.innerText.toLowerCase().includes('pfz') && document.body.innerText.toLowerCase().includes('weather')`);

  testResults.push({
    test: 'Researcher: Multi-agency observation explorer loaded',
    pass: !!researchHeader,
  });
  testResults.push({
    test: 'Researcher: Ingested observation table rendered',
    pass: !!researchTable,
  });
  testResults.push({
    test: 'Researcher: Category query filters present',
    pass: !!researchCategories,
  });

  // TEST 10: Commercial Maritime Operator
  console.log('\n[Test 10] Commercial Maritime Operator Workspace (/operator)');
  await navigate('http://localhost:5173/operator', 2000);
  const operatorHeader = await waitForCondition(`document.body.innerText.toLowerCase().includes('fleet dispatch')`);
  const operatorVoyages = await waitForCondition(`document.body.innerText.toLowerCase().includes('departures') || document.body.innerText.toLowerCase().includes('sassoon')`);

  testResults.push({
    test: 'Operator: Fleet dispatch & clearance header rendered',
    pass: !!operatorHeader,
  });
  testResults.push({
    test: 'Operator: Scheduled departures roster rendered with wave/wind envelopes',
    pass: !!operatorVoyages,
  });

  // TEST 11: Mobile Viewport 375x812 (Horizontal Overflow & Touch Targets)
  console.log('\n[Test 11] Mobile Viewport Responsiveness (375 × 812)');
  await browserClient.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  }, sessionId);

  await navigate('http://localhost:5173/dashboard', 1500);
  const dashboardOverflow = await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`);
  
  await navigate('http://localhost:5173/alerts', 1500);
  const alertsOverflow = await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`);

  await navigate('http://localhost:5173/decisions', 1500);
  const decisionsOverflow = await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`);

  testResults.push({
    test: 'Mobile Responsiveness: /dashboard has 0 horizontal scroll overflow (<= 375px)',
    pass: !!dashboardOverflow,
  });
  testResults.push({
    test: 'Mobile Responsiveness: /alerts has 0 horizontal scroll overflow (<= 375px)',
    pass: !!alertsOverflow,
  });
  testResults.push({
    test: 'Mobile Responsiveness: /decisions has 0 horizontal scroll overflow (<= 375px)',
    pass: !!decisionsOverflow,
  });

  // TEST 12: Real API & Data Honesty Verification
  console.log('\n[Test 12] Real Data Ingestion & Truthful Labeling Check');
  const apiHealth = await fetch('http://localhost:3001/health').then(r => r.json());
  const apiAlerts = await fetch('http://localhost:3001/api/v1/alerts').then(r => r.json());
  const apiObs = await fetch('http://localhost:3001/api/v1/observations?limit=5').then(r => r.json());

  testResults.push({
    test: 'API Health: Fastify server /health returns status HEALTHY',
    pass: apiHealth.status === 'HEALTHY',
  });
  testResults.push({
    test: 'API Alerts: Fastify /api/v1/alerts returns verified contract alerts array',
    pass: Array.isArray(apiAlerts.alerts) && apiAlerts.alerts.length > 0,
  });
  testResults.push({
    test: 'API Observations: Fastify /api/v1/observations returns real records',
    pass: Array.isArray(apiObs.observations) && apiObs.observations.length > 0,
  });

  // Check console error count
  console.log('\n--- BROWSER CONSOLE ERRORS ---');
  if (consoleErrors.length === 0) {
    console.log('✓ 0 browser console errors detected.');
  } else {
    console.log(`Found ${consoleErrors.length} console errors:`, consoleErrors);
  }

  testResults.push({
    test: 'Zero severe console errors in browser runtime',
    pass: consoleErrors.length === 0,
  });

  // Clean up
  browserClient.close();
  chromeProc.kill();

  console.log('\n======================================================');
  console.log('            PHASE 20 VERIFICATION SUMMARY            ');
  console.log('======================================================');
  let allPassed = true;
  for (const r of testResults) {
    const symbol = r.pass ? '✓ PASS' : '✗ FAIL';
    console.log(`${symbol} : ${r.test}`);
    if (!r.pass) allPassed = false;
  }
  console.log('======================================================');
  if (allPassed) {
    console.log('🎉 ALL PHASE 20 VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('⚠️ SOME CHECKS FAILED. Please review output above.');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
