import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\65947ab1-7bfb-4183-9855-9130148f5217\\scratch\\chrome_p21_audit';
const CDP_PORT = 9223;

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

async function runAudit() {
  console.log('============================================================');
  console.log('PHASE 21: STEP 1 — REAL BROWSER UX AUDIT VIA CHROME CDP');
  console.log('============================================================\n');

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
      await sleep(200);
    }
    return false;
  }

  const uxFindings = [];

  // 1. Audit /dashboard
  console.log('Auditing /dashboard...');
  await navigate('http://localhost:5173/dashboard', 2000);
  const dashboardDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const hasNumericConfidence = /\\b\\d{1,2}\\.\\d%|\\b\\d{2}%\\s*(confidence|verified)/i.test(text);
    const hasOnlineBadge = text.includes('ONLINE');
    const hasOfflineBadge = text.includes('OFFLINE');
    const hasGpsIndicator = text.toLowerCase().includes('gps');
    const hasStaleWarning = text.toLowerCase().includes('stale') || text.toLowerCase().includes('cached');
    return {
      title: document.title,
      textSnippet: text.slice(0, 300),
      hasNumericConfidence,
      matches: text.match(/(\\d{1,2}(\\.\\d)?%\\s*([a-zA-Z]+)?)/g) || [],
      hasOnlineBadge,
      hasOfflineBadge,
      hasGpsIndicator,
      hasStaleWarning
    };
  })()`);

  console.log('  /dashboard findings:', dashboardDetails);
  if (!dashboardDetails.hasGpsIndicator) {
    uxFindings.push({
      page: '/dashboard',
      category: 'CONNECTIVITY_GPS_SEPARATION',
      severity: 'HIGH',
      issue: 'TopBar/Dashboard does not separate GPS sensor status from Internet connectivity. User can confuse GPS with network.',
    });
  }
  if (dashboardDetails.hasNumericConfidence) {
    uxFindings.push({
      page: '/dashboard',
      category: 'NUMERIC_CONFIDENCE',
      severity: 'HIGH',
      issue: `Found numeric confidence percentages: ${dashboardDetails.matches.join(', ')}. Must be replaced with categorical confidence (HIGH/MODERATE/LOW).`,
    });
  }

  // 2. Audit /ask
  console.log('Auditing /ask...');
  await navigate('http://localhost:5173/ask?q=Can+I+go+fishing+today+near+Mumbai%3F', 2500);
  const askDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const matches = text.match(/(\\d{1,2}(\\.\\d)?%\\s*([a-zA-Z]+)?)/g) || [];
    const hasOfflineModeNotice = text.toLowerCase().includes('offline') || text.toLowerCase().includes('cached');
    return {
      textLength: text.length,
      matches,
      hasOfflineModeNotice
    };
  })()`);
  console.log('  /ask findings:', askDetails);
  if (askDetails.matches.length > 0) {
    uxFindings.push({
      page: '/ask',
      category: 'NUMERIC_CONFIDENCE',
      severity: 'HIGH',
      issue: `Found numeric percentages on /ask: ${askDetails.matches.join(', ')}`,
    });
  }

  // 3. Audit /decisions
  console.log('Auditing /decisions...');
  await navigate('http://localhost:5173/decisions', 2000);
  const decisionDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const matches = text.match(/(confidence\\s*\\d{1,2}(\\.\\d)?%|\\d{1,2}(\\.\\d)?%\\s*confidence)/gi) || [];
    return {
      matches,
      hasLvl1: text.includes('Level 1') || text.includes('VERDICT'),
      hasLvl3: text.includes('Level 3') || text.includes('Evidence')
    };
  })()`);
  console.log('  /decisions findings:', decisionDetails);
  if (decisionDetails.matches.length > 0) {
    uxFindings.push({
      page: '/decisions',
      category: 'NUMERIC_CONFIDENCE',
      severity: 'HIGH',
      issue: `Found numeric confidence in /decisions: ${decisionDetails.matches.join(', ')}`,
    });
  }

  // 4. Audit /history
  console.log('Auditing /history...');
  await navigate('http://localhost:5173/history', 2000);
  const historyDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const matches = text.match(/(\\d{1,2}\\.\\d%|\\d{2}%\\s*(verified|confidence))/gi) || [];
    return {
      matches,
      recordCount: document.querySelectorAll('button').length
    };
  })()`);
  console.log('  /history findings:', historyDetails);
  if (historyDetails.matches.length > 0) {
    uxFindings.push({
      page: '/history',
      category: 'NUMERIC_CONFIDENCE',
      severity: 'HIGH',
      issue: `Found numeric confidence percentages in /history: ${historyDetails.matches.join(', ')}`,
    });
  }

  // 5. Audit /alerts
  console.log('Auditing /alerts...');
  await navigate('http://localhost:5173/alerts', 2000);
  const alertDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const alertCards = document.querySelectorAll('[class*="border"]').length;
    const hasSyncStatus = text.toLowerCase().includes('sync') || text.toLowerCase().includes('cached');
    return {
      textLength: text.length,
      hasSyncStatus,
      matches: text.match(/(\\d{1,2}\\.\\d%\\s*confidence)/gi) || []
    };
  })()`);
  console.log('  /alerts findings:', alertDetails);

  // 6. Audit /map
  console.log('Auditing /map...');
  await navigate('http://localhost:5173/map', 2000);
  const mapDetails = await evaluate(`(() => {
    const text = document.body.innerText;
    const hasOfflineFallback = text.toLowerCase().includes('offline') || text.toLowerCase().includes('cached');
    return {
      hasPresets: text.includes('Fisherman View'),
      hasOfflineFallback
    };
  })()`);
  console.log('  /map findings:', mapDetails);

  // 7. Audit Mobile Viewport 375x812 across /dashboard, /ask, /alerts, /decisions
  console.log('Auditing Mobile Viewport (375x812)...');
  await browserClient.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  }, sessionId);

  await navigate('http://localhost:5173/dashboard', 1500);
  const mobileDashboard = await evaluate(`(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const hasHorizontalOverflow = scrollWidth > clientWidth;
    const topBarHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
    return {
      scrollWidth,
      clientWidth,
      hasHorizontalOverflow,
      topBarHeight
    };
  })()`);
  console.log('  Mobile /dashboard findings:', mobileDashboard);
  if (mobileDashboard.hasHorizontalOverflow) {
    uxFindings.push({
      page: '/dashboard [mobile]',
      category: 'MOBILE_RESPONSIVENESS',
      severity: 'HIGH',
      issue: `Horizontal overflow detected: scrollWidth (${mobileDashboard.scrollWidth}) > clientWidth (${mobileDashboard.clientWidth})`,
    });
  }

  // Mobile TopBar inspection
  const mobileTopBarInspect = await evaluate(`(() => {
    const header = document.querySelector('header');
    if (!header) return null;
    const badges = Array.from(header.querySelectorAll('div, button')).map(el => el.innerText.trim()).filter(Boolean);
    return badges;
  })()`);
  console.log('  Mobile TopBar elements:', mobileTopBarInspect);

  console.log('\n============================================================');
  console.log(`TOTAL UX FINDINGS: ${uxFindings.length}`);
  console.log('============================================================');
  for (const f of uxFINDINGS(uxFindings)) {
    console.log(`- [${f.severity}] ${f.page} (${f.category}): ${f.issue}`);
  }

  await browserClient.send('Target.closeTarget', { targetId });
  browserClient.close();
  chromeProc.kill();
  console.log('\n✓ Browser audit completed cleanly.');
}

function uxFINDINGS(arr) {
  return arr;
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
