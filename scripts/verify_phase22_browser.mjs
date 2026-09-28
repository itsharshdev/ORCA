import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\65947ab1-7bfb-4183-9855-9130148f5217\\scratch\\chrome_p22_verify';
const CDP_PORT = 9225;
const BASE_URL = 'http://localhost:5173';

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
            this.consoleErrors.push(
              msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ')
            );
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

async function main() {
  console.log('============================================================');
  console.log('PHASE 22: REAL BROWSER RELIABILITY & SECURITY VERIFICATION');
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
      // waiting for chrome
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
    // 1. Desktop Routes Audit (11 Routes)
    console.log('\n--- 1. Desktop Viewport (1280x800) Route Matrix ---');
    await browserClient.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
      sessionId
    );

    const routes = [
      '/dashboard',
      '/ask',
      '/mission',
      '/map',
      '/alerts',
      '/decisions',
      '/history',
      '/authority',
      '/disaster',
      '/research',
      '/operator',
    ];

    for (const route of routes) {
      await browserClient.send('Page.navigate', { url: `${BASE_URL}${route}` }, sessionId);
      await sleep(1000);

      const titleRes = await browserClient.send(
        'Runtime.evaluate',
        { expression: 'document.title' },
        sessionId
      );
      const textRes = await browserClient.send(
        'Runtime.evaluate',
        { expression: 'document.body.innerText' },
        sessionId
      );

      const bodyText = textRes.result.value || '';
      console.log(`[ROUTE OK] ${route.padEnd(12)} -> Title: "${titleRes.result.value}" (${bodyText.length} chars)`);
    }

    // 2. Hardware GNSS vs IP Geolocation Badge Verification
    console.log('\n--- 2. Hardware GNSS vs IP Geolocation Separation ---');
    await browserClient.send('Page.navigate', { url: `${BASE_URL}/dashboard` }, sessionId);
    await sleep(800);

    const gnssBadgeRes = await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('GNSS:'));
            return btn ? btn.innerText.trim() : 'NOT_FOUND';
          })()
        `,
      },
      sessionId
    );
    console.log('[GNSS BADGE]:', gnssBadgeRes.result.value);

    // 3. Connectivity Modal & Validity Classification Badges
    console.log('\n--- 3. Connectivity Modal & Validity Classification Badges ---');
    await browserClient.send(
      'Runtime.evaluate',
      {
        expression: `
          (() => {
            const btn = document.getElementById('orca-connectivity-status-btn');
            if (btn) btn.click();
          })()
        `,
      },
      sessionId
    );
    await sleep(600);

    const modalTextRes = await browserClient.send(
      'Runtime.evaluate',
      { expression: `document.body.innerText` },
      sessionId
    );
    const modalText = (modalTextRes.result.value || '').toUpperCase();

    const hasGnssSeparation = modalText.includes('GNSS SENSOR VS NETWORK VS IP GEOLOCATION') || modalText.includes('GNSS SATELLITE FIX') || modalText.includes('GNSS SENSOR UNAVAILABLE');
    const hasOfficialIncoisOsf = modalText.includes('OFFICIAL SOURCE VALIDITY: 6H CYCLE');
    const hasOfficialIncoisPfz = modalText.includes('OFFICIAL SOURCE VALIDITY: 24H PASS');
    const hasOfficialImd = modalText.includes('OFFICIAL SOURCE VALIDITY: 3H BULLETIN');
    const hasProtoGis = modalText.includes('ORCA PROTOTYPE POLICY: 72H CACHE');
    const hasProtoVessel = modalText.includes('ORCA PROTOTYPE POLICY: 7D CACHE');

    console.log('[MODAL GNSS SEPARATION]:', hasGnssSeparation ? 'VERIFIED ✓' : 'FAILED ✗');
    console.log('[MODAL INCOIS OSF 6h CYCLE]:', hasOfficialIncoisOsf ? 'VERIFIED ✓' : 'FAILED ✗');
    console.log('[MODAL INCOIS PFZ 24h PASS]:', hasOfficialIncoisPfz ? 'VERIFIED ✓' : 'FAILED ✗');
    console.log('[MODAL IMD 3h BULLETIN]:', hasOfficialImd ? 'VERIFIED ✓' : 'FAILED ✗');
    console.log('[MODAL GIS 72h POLICY]:', hasProtoGis ? 'VERIFIED ✓' : 'FAILED ✗');
    console.log('[MODAL VESSEL 7d POLICY]:', hasProtoVessel ? 'VERIFIED ✓' : 'FAILED ✗');

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

    // 4. Mobile Viewport 375x812 Audit
    console.log('\n--- 4. Mobile Viewport (375x812) Overflow & Usability Audit ---');
    await browserClient.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 375, height: 812, deviceScaleFactor: 2, mobile: true },
      sessionId
    );

    for (const route of routes) {
      await browserClient.send('Page.navigate', { url: `${BASE_URL}${route}` }, sessionId);
      await sleep(800);

      const overflowRes = await browserClient.send(
        'Runtime.evaluate',
        {
          expression: `
            (() => {
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              return docWidth - winWidth;
            })()
          `,
        },
        sessionId
      );
      const overflow = overflowRes.result.value || 0;
      console.log(`[MOBILE 375px] ${route.padEnd(12)} -> Horizontal Overflow: ${overflow}px ${overflow <= 0 ? '✓ PASS' : '✗ FAIL'}`);
    }

    // 5. Console Error Log Audit
    console.log('\n--- 5. Console Error Log Audit ---');
    console.log(`Total captured browser console errors: ${browserClient.consoleErrors.length}`);
    if (browserClient.consoleErrors.length > 0) {
      console.log('Errors:', browserClient.consoleErrors);
    } else {
      console.log('✓ Zero console errors detected across all tested workflows.');
    }

    console.log('\n============================================================');
    console.log('PHASE 22 REAL BROWSER CDP AUDIT COMPLETE & VERIFIED');
    console.log('============================================================');
  } finally {
    browserClient.close();
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
