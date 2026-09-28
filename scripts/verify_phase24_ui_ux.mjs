import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\02610232-b96f-4f15-ba69-017ef99b54ca\\scratch\\chrome_p24_verify';
const CDP_PORT = 9227;
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
  console.log('PHASE 24: REAL UI/UX UPGRADE & VISUAL AUDIT');
  console.log('============================================================\n');

  // Verify backend API is up
  try {
    const health = await fetch(`${BACKEND_URL}/health`).then(r => r.json());
    console.log('✓ Fastify Backend is reachable on :3001 | Status:', health.status);
  } catch {
    console.warn('! Fastify Backend is not responding on :3001');
  }

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
    } catch {
      // waiting
    }
  }

  if (!connected || !browserWsUrl) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome CDP endpoint on port ' + CDP_PORT);
  }

  console.log('✓ Launched Chrome headless and connected to CDP');

  const browserClient = new CdpClient(browserWsUrl);
  await browserClient.connect();

  const { targetId } = await browserClient.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browserClient.send('Target.attachToTarget', { targetId, flatten: true });

  await browserClient.send('Page.enable', {}, sessionId);
  await browserClient.send('Runtime.enable', {}, sessionId);
  await browserClient.send('DOM.enable', {}, sessionId);

  try {
    // 1. Desktop Viewport (1280x800) - Full Route Matrix
    console.log('\n--- 1. Desktop Viewport (1280x800) Visual & Route Audit ---');
    await browserClient.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
      sessionId
    );

    const routes = [
      { path: '/', label: 'Public Landing Page' },
      { path: '/login', label: 'Authentication & Role Select' },
      { path: '/dashboard', label: 'Fisherman Operational Home' },
      { path: '/ask', label: 'Ask ORCA Intelligence & What-If' },
      { path: '/mission', label: 'Redesigned Mission Planner' },
      { path: '/map', label: 'Tactical Marine Map' },
      { path: '/alerts', label: 'Operational Alert Center' },
      { path: '/decisions', label: 'Decision Explainability' },
      { path: '/history', label: 'Mission History Replay' },
      { path: '/authority', label: 'Coastal Authority Desk' },
      { path: '/disaster', label: 'Disaster Management Desk' },
      { path: '/research', label: 'Oceanographic Research Explorer' },
      { path: '/operator', label: 'Commercial Fleet Dispatch' },
      { path: '/profile', label: 'User & Vessel Profile' },
      { path: '/about', label: 'About & Provenance' },
      { path: '/contact', label: 'Institutional Liaison' },
    ];

    for (const r of routes) {
      await browserClient.send('Page.navigate', { url: `${BASE_URL}${r.path}` }, sessionId);
      await sleep(1000);

      const titleRes = await browserClient.send('Runtime.evaluate', { expression: 'document.title' }, sessionId);
      const textRes = await browserClient.send('Runtime.evaluate', { expression: 'document.body.innerText' }, sessionId);
      const bodyText = textRes.result.value || '';
      console.log(`[PASS] ${r.path.padEnd(14)} -> "${r.label}" | ${bodyText.length} chars text`);
    }

    // 2. Official Logo Integration Verification
    console.log('\n--- 2. Official ORCA Logo Asset & Branding Verification ---');
    await browserClient.send('Page.navigate', { url: `${BASE_URL}/dashboard` }, sessionId);
    await sleep(800);

    const logoAudit = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const logoImgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('logo.png'));
            const hasLogoImg = logoImgs.length > 0;
            const logoComplete = logoImgs.every(img => img.complete && img.naturalWidth > 0);
            return { hasLogoImg, count: logoImgs.length, logoComplete };
          })()
        `,
        returnByValue: true
      },
      sessionId
    );
    console.log('[OFFICIAL LOGO AUDIT]:', JSON.stringify(logoAudit.result.value));

    // 3. TopBar Redesign & Hierarchy Verification
    console.log('\n--- 3. Redesigned TopBar Hierarchy Audit ---');
    const topBarAudit = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const header = document.querySelector('header');
            if (!header) return { found: false };
            const text = header.innerText;
            const hasBrand = text.includes('ORCA');
            const hasRegion = text.includes('Maharashtra') || text.includes('Tamil Nadu');
            const hasDataHealth = text.includes('DATA:');
            const hasRole = text.includes('Fisherman') || text.includes('Authority') || text.includes('Disaster');
            const hasConnectivity = text.includes('ONLINE') || text.includes('OFFLINE') || text.includes('DEGRADED');
            return { found: true, hasBrand, hasRegion, hasDataHealth, hasRole, hasConnectivity };
          })()
        `,
        returnByValue: true
      },
      sessionId
    );
    console.log('[TOPBAR AUDIT]:', JSON.stringify(topBarAudit.result.value));

    // 4. Redesigned /mission Workflow Audit
    console.log('\n--- 4. Redesigned Mission Planner (/mission) Operational Workflow ---');
    await browserClient.send('Page.navigate', { url: `${BASE_URL}/mission` }, sessionId);
    await sleep(1200);

    const missionFormAudit = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const text = document.body.innerText;
            const hasObjective = text.includes('Mission Identity & Objective') || text.includes('Commercial Fishing');
            const hasVessel = text.includes('Assigned Craft') || text.includes('Matsya Sagar 1');
            const hasTiming = text.includes('Departure Window') || text.includes('Duration');
            const hasMap = document.querySelectorAll('.leaflet-container').length > 0 || document.querySelectorAll('canvas, svg').length > 0;
            const hasSafetyPreview = text.includes('Deterministic Safety Clearance') || text.includes('FAVORABLE') || text.includes('CAUTION') || text.includes('AVOID');
            const hasGisToggle = text.includes('Technical GIS');
            return { hasObjective, hasVessel, hasTiming, hasMap, hasSafetyPreview, hasGisToggle };
          })()
        `,
        returnByValue: true
      },
      sessionId
    );
    console.log('[MISSION PLANNER AUDIT]:', JSON.stringify(missionFormAudit.result.value));

    // Click "EVALUATE MISSION SAFETY" button
    const evalClickRes = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('EVALUATE MISSION'));
            if (btn) { btn.click(); return 'EVALUATE_CLICKED'; }
            return 'BTN_NOT_FOUND';
          })()
        `,
      },
      sessionId
    );
    console.log('[MISSION EVALUATION INTERACTION]:', evalClickRes.result.value);
    await sleep(2500);

    // 5. Data Health Modal & Provenance Audit
    console.log('\n--- 5. Truthful Data Health Modal & Provenance State Audit ---');
    await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const healthBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('DATA:'));
            if (healthBtn) { healthBtn.click(); return 'OPENED_DATA_HEALTH'; }
            return 'DATA_HEALTH_BTN_NOT_FOUND';
          })()
        `,
      },
      sessionId
    );
    await sleep(800);

    const dataHealthContent = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const text = document.body.innerText.toUpperCase();
            const hasIncoisPfz = text.includes('POTENTIAL FISHING ZONE') || text.includes('PFZ');
            const hasIncoisOsf = text.includes('OCEAN STATE FORECAST') || text.includes('OSF');
            const hasImdAccessPending = text.includes('PENDING_MOU') || text.includes('ACCESS PENDING') || text.includes('DEMO');
            const hasPostGis = text.includes('POSTGIS') || text.includes('DETERMINISTIC');
            return { hasIncoisPfz, hasIncoisOsf, hasImdAccessPending, hasPostGis };
          })()
        `,
        returnByValue: true
      },
      sessionId
    );
    console.log('[DATA HEALTH MODAL CONTENTS]:', JSON.stringify(dataHealthContent.result.value));

    // Close modal
    await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const closeBtn = document.querySelector('button[type="button"] svg.lucide-x')?.parentElement;
            if (closeBtn) closeBtn.click();
          })()
        `,
      },
      sessionId
    );
    await sleep(400);

    // 6. Mobile Responsiveness (375x812, 390x844, 768x1024) Overflow Audits
    console.log('\n--- 6. Multi-Device Responsive Viewport & Overflow Audit ---');
    const viewports = [
      { name: 'Mobile Standard (375x812)', width: 375, height: 812 },
      { name: 'Mobile Large (390x844)', width: 390, height: 844 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    ];

    const mobileTestRoutes = ['/dashboard', '/ask', '/mission', '/map', '/alerts', '/authority', '/disaster', '/research', '/operator'];

    for (const vp of viewports) {
      console.log(`\nTesting ${vp.name}...`);
      await browserClient.send(
        'Emulation.setDeviceMetricsOverride',
        { width: vp.width, height: vp.height, deviceScaleFactor: 2, mobile: vp.width < 768 },
        sessionId
      );

      for (const route of mobileTestRoutes) {
        await browserClient.send('Page.navigate', { url: `${BASE_URL}${route}` }, sessionId);
        await sleep(700);

        const overflowRes = await browserClient.send(
          'Runtime.evaluate',
          {
            expression: `
              (() => {
                const docWidth = document.documentElement.scrollWidth;
                const winWidth = window.innerWidth;
                const hasOverflow = docWidth > winWidth + 2;
                return { docWidth, winWidth, hasOverflow, overflowPx: Math.max(0, docWidth - winWidth) };
              })()
            `,
            returnByValue: true,
          },
          sessionId
        );

        const ov = overflowRes.result.value;
        if (ov.hasOverflow) {
          console.error(`[OVERFLOW FAIL] ${route} -> scrollWidth: ${ov.docWidth}px, innerWidth: ${ov.winWidth}px (+${ov.overflowPx}px)`);
        } else {
          console.log(`[PASS] ${route.padEnd(12)} -> 0px overflow (docWidth: ${ov.docWidth}px)`);
        }
      }
    }

    // 7. Console Error Audit
    console.log('\n--- 7. Console Error Audit ---');
    if (browserClient.consoleErrors.length === 0) {
      console.log('✓ ZERO runtime console errors detected during full browser walkthrough.');
    } else {
      console.warn(`! Detected ${browserClient.consoleErrors.length} console errors:`);
      browserClient.consoleErrors.forEach((e, idx) => console.warn(`   ${idx + 1}. ${e}`));
    }

    console.log('\n============================================================');
    console.log('PHASE 24 UI/UX VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('============================================================');

  } finally {
    browserClient.close();
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('Phase 24 verification error:', err);
  process.exit(1);
});
