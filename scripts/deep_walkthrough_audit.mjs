import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\02610232-b96f-4f15-ba69-017ef99b54ca\\scratch\\chrome_reality_v2';
const CDP_PORT = 9229;
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
  console.log('ORCA V2 REALITY AUDIT: DEEP BROWSER WALKTHROUGH');
  console.log('============================================================\n');

  if (existsSync(USER_DATA_DIR)) {
    try { rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch {}
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

    // 1. Full Route & UI Inspection
    const routesToTest = [
      { path: '/', role: 'PUBLIC', name: 'Landing' },
      { path: '/login', role: 'PUBLIC', name: 'Login' },
      { path: '/about', role: 'PUBLIC', name: 'About' },
      { path: '/contact', role: 'PUBLIC', name: 'Contact' },
      { path: '/dashboard', role: 'FISHERMAN', name: 'Dashboard' },
      { path: '/ask', role: 'FISHERMAN', name: 'Ask ORCA' },
      { path: '/mission', role: 'FISHERMAN', name: 'Mission Planner' },
      { path: '/map', role: 'FISHERMAN', name: 'Marine Map' },
      { path: '/alerts', role: 'FISHERMAN', name: 'Alerts' },
      { path: '/decisions', role: 'FISHERMAN', name: 'Decisions' },
      { path: '/history', role: 'FISHERMAN', name: 'History' },
      { path: '/profile', role: 'FISHERMAN', name: 'Profile' },
      { path: '/settings', role: 'FISHERMAN', name: 'Settings' },
      { path: '/authority', role: 'AUTHORITY', name: 'Authority' },
      { path: '/disaster', role: 'DISASTER', name: 'Disaster' },
      { path: '/research', role: 'RESEARCHER', name: 'Research' },
      { path: '/operator', role: 'OPERATOR', name: 'Operator' }
    ];

    console.log('\n--- SECTION 1: ROUTE INVENTORY & VISUAL FIRST IMPRESSION ---');
    for (const r of routesToTest) {
      await navigateTo(r.path);
      const pageData = await evaluate(`(() => {
        const h1 = document.querySelector('h1')?.innerText || '';
        const h2 = document.querySelector('h2')?.innerText || '';
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        const links = Array.from(document.querySelectorAll('a')).map(a => a.innerText.trim()).filter(Boolean);
        const cards = document.querySelectorAll('.rounded-xl, .rounded-2xl, .bg-white').length;
        const text = document.body.innerText;
        return {
          title: document.title,
          heading: h1 || h2,
          buttonsCount: buttons.length,
          topButtons: buttons.slice(0, 5),
          cardsCount: cards,
          hasLogo: !!document.querySelector('img[src*="logo.png"]'),
          hasAlerts: text.includes('CRITICAL') || text.includes('WARNING') || text.includes('ADVISORY'),
          hasVerdict: text.includes('GO') || text.includes('CAUTION') || text.includes('AVOID'),
          textSnippet: text.substring(0, 160).replace(/\\n/g, ' ')
        };
      })()`);
      console.log(`[${r.name}] ${r.path} -> Heading: "${pageData.heading}" | Cards: ${pageData.cardsCount} | Buttons: ${pageData.buttonsCount} | Logo: ${pageData.hasLogo}`);
    }

    // 2. Interactive Flagship Journey Testing
    console.log('\n--- SECTION 2: INTERACTIVE FLAGSHIP JOURNEY & MODALS ---');
    await navigateTo('/dashboard');
    await sleep(500);

    // Test TopBar Data Health Modal
    const dataHealthTest = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('DATA HEALTH') || b.innerText.includes('LIVE') || b.innerText.includes('CACHED'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()`);
    await sleep(400);
    const dataHealthModalOpen = await evaluate(`(() => {
      const modal = document.querySelector('[role="dialog"], .fixed');
      const text = modal ? modal.innerText : '';
      return {
        isOpen: !!modal,
        hasIncois: text.includes('INCOIS'),
        hasImd: text.includes('IMD'),
        hasPostGis: text.includes('PostGIS') || text.includes('POSTGIS'),
        textSnippet: text.substring(0, 200).replace(/\\n/g, ' ')
      };
    })()`);
    console.log('[TOPBAR DATA HEALTH MODAL]:', dataHealthTest, dataHealthModalOpen);

    // Close modal (ESC or close button)
    await evaluate(`(() => {
      const closeBtn = document.querySelector('button[aria-label="Close"], .fixed button');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(300);

    // Test Mission Planner slider and clearance evaluation
    await navigateTo('/mission');
    await sleep(500);
    const missionPlannerInteraction = await evaluate(`(() => {
      const slider = document.querySelector('input[type="range"]');
      let sliderChanged = false;
      if (slider) {
        slider.value = 8;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
        sliderChanged = true;
      }
      const evalBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('EVALUATE') || b.innerText.includes('Evaluate'));
      if (evalBtn) {
        evalBtn.click();
      }
      return {
        sliderChanged,
        hasEvalBtn: !!evalBtn,
        cardVerdict: document.body.innerText.includes('GO') ? 'GO' : document.body.innerText.includes('CAUTION') ? 'CAUTION' : document.body.innerText.includes('AVOID') ? 'AVOID' : 'UNKNOWN'
      };
    })()`);
    console.log('[MISSION PLANNER INTERACTION]:', missionPlannerInteraction);

    // Test Map canvas rendering & layer controls
    await navigateTo('/map');
    await sleep(600);
    const mapCanvasAudit = await evaluate(`(() => {
      const leafletContainer = document.querySelector('.leaflet-container');
      const layerButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Safety') || b.innerText.includes('PFZ') || b.innerText.includes('Wave') || b.innerText.includes('Vessel'));
      return {
        hasLeaflet: !!leafletContainer,
        layerButtonLabels: layerButtons.map(b => b.innerText.trim())
      };
    })()`);
    console.log('[TACTICAL MAP AUDIT]:', mapCanvasAudit);

    // Test Alerts & Modal details
    await navigateTo('/alerts');
    await sleep(500);
    const alertsAudit = await evaluate(`(() => {
      const alertCards = document.querySelectorAll('.cursor-pointer, [role="button"]');
      return {
        cardCount: alertCards.length,
        hasCritical: document.body.innerText.includes('CRITICAL'),
        hasAdvisory: document.body.innerText.includes('ADVISORY')
      };
    })()`);
    console.log('[ALERTS AUDIT]:', alertsAudit);

    // 3. Mobile Viewport Interaction (375x812)
    console.log('\n--- SECTION 3: MOBILE (375x812) INTERACTION AUDIT ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    }, sessionId);

    const mobileRoutes = ['/dashboard', '/ask', '/mission', '/map', '/alerts', '/authority', '/disaster', '/operator'];
    for (const p of mobileRoutes) {
      await navigateTo(p);
      const mobileMetrics = await evaluate(`(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        const overflow = Math.max(0, docWidth - viewWidth);
        const bottomNav = document.querySelector('nav.fixed, .bottom-0');
        const touchButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.height < 32 && rect.width < 32 && el.innerText.trim().length > 0;
        });
        return {
          overflowPx: overflow,
          hasBottomNav: !!bottomNav,
          smallTouchTargetCount: touchButtons.length
        };
      })()`);
      console.log(`[MOBILE 375x812] ${p.padEnd(12)} -> Overflow: ${mobileMetrics.overflowPx}px | BottomNav: ${mobileMetrics.hasBottomNav} | Small Targets: ${mobileMetrics.smallTouchTargetCount}`);
    }

    // 4. API Endpoints Direct Audit
    console.log('\n--- SECTION 4: REAL BACKEND API & INVARIANT AUDIT ---');

    // A. Ask ORCA Query Endpoint
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
    console.log('[API /orca/query]: Status:', qRes.status, '| Verdict:', qData.decision?.verdict, '| Score:', qData.decision?.confidenceScore, '| Rules Count:', (qData.decision?.ruleEvaluations || []).length);

    // B. What-If Scenario Evaluation
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
    console.log('[API /scenarios/evaluate]: Status:', scRes.status, '| Baseline Verdict:', scData.baseline?.verdict, '| Scenario Verdict:', scData.scenario?.verdict, '| IsHypothetical:', scData.isHypotheticalAssumption);

    // C. Deterministic Decision Engine (Normal vs High Wave vs Restricted Incursion)
    const dNormal = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vesselId: "VESSEL-001",
        departureTime: new Date(Date.now() + 3600000).toISOString(),
        durationHours: 4,
        originLocation: { latitude: 18.64, longitude: 72.87 },
        environmentalContext: { waveHeightMeters: 1.1, windSpeedKnots: 10, seaSurfaceTemperatureCelsius: 28 }
      })
    }).then(r => r.json());

    const dBreach = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vesselId: "VESSEL-001",
        departureTime: new Date(Date.now() + 3600000).toISOString(),
        durationHours: 4,
        originLocation: { latitude: 18.64, longitude: 72.87 },
        environmentalContext: { waveHeightMeters: 2.8, windSpeedKnots: 24 }
      })
    }).then(r => r.json());

    const dRestricted = await fetch(`${BACKEND_URL}/decisions/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vesselId: "VESSEL-001",
        departureTime: new Date(Date.now() + 3600000).toISOString(),
        durationHours: 4,
        originLocation: { latitude: 18.91, longitude: 72.81 }, // Mumbai Naval Anchorage
        environmentalContext: { waveHeightMeters: 1.0, windSpeedKnots: 8 }
      })
    }).then(r => r.json());

    console.log('[DETERMINISTIC EVALUATION]:');
    console.log(' -> Normal 1.1m wave:', dNormal.decision?.verdict || dNormal.verdict);
    console.log(' -> Wave breach 2.8m (vs 1.8m FRP boat limit):', dBreach.decision?.verdict || dBreach.verdict);
    console.log(' -> Restricted Naval Zone incursion:', dRestricted.decision?.verdict || dRestricted.verdict);

    console.log('\n--- SECTION 5: CONSOLE ERRORS & INTEGRITY ---');
    console.log('Total Console Errors recorded:', client.consoleErrors.length);
    if (client.consoleErrors.length > 0) {
      console.log('Errors:', client.consoleErrors.slice(0, 5));
    }

    client.close();
  } finally {
    chromeProc.kill();
  }
}

main().catch(console.error);
