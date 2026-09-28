import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, existsSync } from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\65947ab1-7bfb-4183-9855-9130148f5217\\scratch\\chrome_p21_verify';
const CDP_PORT = 9224;

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

async function main() {
  console.log('============================================================');
  console.log('PHASE 21: REAL BROWSER VERIFICATION MATRIX');
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
      // waiting for chrome to bind port
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

  const consoleErrors = [];
  browserClient.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      const text = params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
      if (!text.includes('download the React DevTools') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  const send = (method, params = {}) => browserClient.send(method, params, sessionId);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function navigate(path) {
    await send('Page.navigate', { url: `http://localhost:5173${path}` });
    await sleep(1500);
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  const results = {
    desktopRoutes: [],
    connectivityModal: null,
    offlineRoleBanners: {},
    askOrcaOffline: null,
    mobile375Routes: [],
    consoleErrorsCount: 0,
  };

  // 1. DESKTOP ROUTES AUDIT (1280x800)
  console.log('\n--- 1. DESKTOP VIEWPORT AUDIT (1280x800) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/ask', name: 'Ask ORCA' },
    { path: '/mission', name: 'Mission Planner' },
    { path: '/map', name: 'Marine Map' },
    { path: '/alerts', name: 'Alerts & Disaster' },
    { path: '/decisions', name: 'Decisions' },
    { path: '/history', name: 'Audit History' },
    { path: '/authority', name: 'Coastal Authority' },
    { path: '/disaster', name: 'Disaster Management' },
    { path: '/research', name: 'Researcher' },
    { path: '/operator', name: 'Commercial Operator' },
  ];

  for (const r of routes) {
    await navigate(r.path);
    const check = await evaluate(`
      ({
        title: document.title,
        heading: document.querySelector('h1')?.innerText || '',
        hasGpsIndicator: document.body.innerText.includes('GPS: FIX') || document.body.innerText.includes('GPS:'),
        hasNetworkBadge: document.body.innerText.includes('CONNECTED') || document.body.innerText.includes('OFFLINE'),
        hasNumericConfidencePct: /\\b\\d{1,3}\\.\\d%\\s*confidence/i.test(document.body.innerText),
      })
    `);
    console.log(`[Desktop] ${r.path} -> "${check.heading.substring(0, 36)}" | GPS: ${check.hasGpsIndicator} | NetBadge: ${check.hasNetworkBadge} | NumericPct: ${check.hasNumericConfidencePct}`);
    results.desktopRoutes.push({ route: r.path, ...check });
  }

  // 2. CONNECTIVITY MODAL AUDIT
  console.log('\n--- 2. CONNECTIVITY MODAL AUDIT ---');
  await navigate('/dashboard');
  await evaluate(`
    (() => {
      const topBadge = document.getElementById('orca-connectivity-status-btn') || Array.from(document.querySelectorAll('button')).find(el => 
        el.innerText && (el.innerText.includes('CONNECTED') || el.innerText.includes('ONLINE'))
      );
      if (topBadge) topBadge.click();
    })()
  `);
  await sleep(600);

  const modalCheck = await evaluate(`
    (() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0');
      if (!modal) return { open: false };
      const text = modal.innerText;
      return {
        open: true,
        hasGpsVsInternet: text.includes('GPS') && text.includes('NETWORK BEARER'),
        hasSourceStatus: text.includes('INCOIS') && text.includes('IMD'),
        hasSimulateButtons: text.includes('Full Offline') && text.includes('Degraded'),
      };
    })()
  `);
  console.log('[Connectivity Modal Opened & Verified]:', modalCheck);
  results.connectivityModal = modalCheck;

  // 3. SIMULATE OFFLINE & ROLE UX HARDENING
  console.log('\n--- 3. OFFLINE SIMULATION & ROLE UX ---');
  await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Full Offline'));
      if (btn) btn.click();
    })()
  `);
  await sleep(500);

  // Close modal
  await evaluate(`
    (() => {
      const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x') || b.innerText.includes('Close'));
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(500);

  // Check top bar reflects OFFLINE with GPS: FIX
  const topBarOffline = await evaluate(`
    ({
      hasOfflineBadge: document.body.innerText.includes('OFFLINE'),
      hasGpsFix: document.body.innerText.includes('GPS: FIX')
    })
  `);
  console.log('[TopBar Offline State]:', topBarOffline);
  results.offlineRoleBanners.topBar = topBarOffline;

  // Check Authority
  await navigate('/authority');
  const authCheck = await evaluate(`({ hasBanner: document.body.innerText.includes('OFFLINE OPERATIONAL SURVEILLANCE') })`);
  console.log('[Authority Offline Banner]:', authCheck.hasBanner);
  results.offlineRoleBanners.authority = authCheck.hasBanner;

  // Check Disaster
  await navigate('/disaster');
  const disCheck = await evaluate(`({ hasBanner: document.body.innerText.includes('OFFLINE DISASTER RESPONSE MODE') })`);
  console.log('[Disaster Offline Banner]:', disCheck.hasBanner);
  results.offlineRoleBanners.disaster = disCheck.hasBanner;

  // Check Researcher
  await navigate('/research');
  const resCheck = await evaluate(`({ hasBanner: document.body.innerText.includes('OFFLINE OBSERVATION REPOSITORY') })`);
  console.log('[Researcher Offline Banner]:', resCheck.hasBanner);
  results.offlineRoleBanners.researcher = resCheck.hasBanner;

  // Check Operator
  await navigate('/operator');
  const opCheck = await evaluate(`({ hasBanner: document.body.innerText.includes('OFFLINE FLEET DISPATCH MODE') })`);
  console.log('[Operator Offline Banner]:', opCheck.hasBanner);
  results.offlineRoleBanners.operator = opCheck.hasBanner;

  // Check Marine Map
  await navigate('/map');
  const mapCheck = await evaluate(`({ hasFloatingNotice: document.body.innerText.includes('OFFLINE: CACHED VECTOR SHELL') })`);
  console.log('[Marine Map Offline Floating Notice]:', mapCheck.hasFloatingNotice);
  results.offlineRoleBanners.map = mapCheck.hasFloatingNotice;

  // 4. ASK ORCA OFFLINE SAFETY TEST
  console.log('\n--- 4. ASK ORCA OFFLINE SAFETY GUARD ---');
  await navigate('/ask');
  await evaluate(`
    (() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText && b.innerText.includes('Can I go fishing')
      );
      if (chip) {
        chip.click();
        return true;
      }
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        setter.call(textarea, 'Can I go fishing today?');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ask') || b.querySelector('svg.lucide-send'));
        if (submitBtn) submitBtn.click();
        return true;
      }
      return false;
    })()
  `);
  await sleep(3500);

  const askSafety = await evaluate(`
    (() => {
      const text = document.body.innerText;
      return {
        hasInsufficientData: text.includes('INSUFFICIENT_DATA'),
        hasOfflineSafetyReasoning: text.includes('OFFLINE DATA UNAVAILABLE') || text.includes('Live oceanographic and weather streams cannot be reached') || text.includes('safety cannot be guaranteed'),
        zeroFakeGo: !text.includes('VERDICT: GO')
      };
    })()
  `);
  console.log('[Ask ORCA Offline Response]:', askSafety);
  results.askOrcaOffline = askSafety;

  // Restore Connected state via modal
  await evaluate(`
    (() => {
      const badge = document.getElementById('orca-connectivity-status-btn') || Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('OFFLINE'));
      if (badge) badge.click();
    })()
  `);
  await sleep(500);
  await evaluate(`
    (() => {
      const onlineBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Connected (4G)') || b.innerText.includes('Reset Auto-Detect'));
      if (onlineBtn) onlineBtn.click();
    })()
  `);
  await sleep(500);
  await evaluate(`
    (() => {
      const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Close') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(500);

  // 5. MOBILE VIEWPORT AUDIT (375x812)
  console.log('\n--- 5. MOBILE VIEWPORT AUDIT (375x812) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  for (const r of routes) {
    await navigate(r.path);
    const check = await evaluate(`
      ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
    `);
    console.log(`[Mobile 375px] ${r.path} -> Overflow: ${check.hasOverflow} (${check.scrollWidth}px vs ${check.clientWidth}px)`);
    results.mobile375Routes.push({ route: r.path, ...check });
  }

  // 6. CONSOLE ERRORS
  results.consoleErrorsCount = consoleErrors.length;
  console.log(`\n[Console Errors Captured]: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  console.log('\n============================================================');
  console.log('BROWSER VERIFICATION COMPLETE — SUMMARY:');
  console.log('============================================================');
  console.log(`- Desktop Routes Audited: ${results.desktopRoutes.length}/11`);
  console.log(`- Misleading Numeric Confidence % on Desktop: ${results.desktopRoutes.some(d => d.hasNumericConfidencePct) ? 'FOUND' : 'NONE (CLEAN)'}`);
  console.log(`- Connectivity Modal Open & Verified: ${results.connectivityModal.open}`);
  console.log(`- GPS Fix vs Internet Separation Verified: ${results.connectivityModal.hasGpsVsInternet}`);
  console.log(`- Offline Role Banners Verified: Authority (${results.offlineRoleBanners.authority}), Disaster (${results.offlineRoleBanners.disaster}), Research (${results.offlineRoleBanners.researcher}), Operator (${results.offlineRoleBanners.operator}), Map (${results.offlineRoleBanners.map})`);
  console.log(`- Ask ORCA Offline Safety Lock: INSUFFICIENT_DATA (${results.askOrcaOffline.hasInsufficientData}), Zero Fake GO (${results.askOrcaOffline.zeroFakeGo})`);
  console.log(`- Mobile 375px Overflow: ${results.mobile375Routes.some(m => m.hasOverflow) ? 'OVERFLOW DETECTED' : '0px OVERFLOW (CLEAN)'}`);
  console.log(`- Total Console Errors: ${results.consoleErrorsCount}`);

  browserClient.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
