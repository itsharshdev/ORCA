import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const FRONTEND_URL = 'http://localhost:5173';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\7853b2ed-1b9c-4a01-8614-82b8972ae5e4\\scratch\\chrome_p17';

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkRequests = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      } else if (msg.method) {
        if (msg.method === 'Runtime.consoleAPICalled') {
          this.consoleLogs.push({
            type: msg.params.type,
            args: msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ')
          });
        } else if (msg.method === 'Network.requestWillBeSent') {
          this.networkRequests.push({
            url: msg.params.request.url,
            method: msg.params.request.method,
            postData: msg.params.request.postData
          });
        }
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : res;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== PHASE 17 BROWSER CDP VERIFICATION ===');
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,800',
    'about:blank'
  ]);

  await sleep(2500);

  const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget) throw new Error('No page target found');

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');
  await client.send('Network.enable');

  console.log('1. Navigating to Ask ORCA (/ask)...');
  await client.send('Page.navigate', { url: `${FRONTEND_URL}/ask` });
  await sleep(3000);

  console.log('2. Submitting Query 1: Feasibility ("Can I go fishing today near Mumbai for 5 hours?")');
  await client.eval(`
    (() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'Can I go fishing today near Mumbai for 5 hours?');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);

  await sleep(500);
  await client.eval(`
    (() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()
  `);

  await sleep(4000);

  const pageState1 = await client.eval(`
    (() => {
      const bodyText = document.body.innerText;
      return {
        hasVerdict: /AVOID|CAUTION|GO/i.test(bodyText),
        hasRationale: /operational rationale|why/i.test(bodyText),
        hasAction: /recommended action plan/i.test(bodyText),
        hasEvidence: /correlated multi-agency evidence/i.test(bodyText),
        hasIntelligenceBadge: /intelligence mode|deterministic reasoning|orca nl reasoning/i.test(bodyText),
        hasOceanData: /incois swell|hs/i.test(bodyText),
        hasPfzData: /incois pfz|zone alpha/i.test(bodyText),
        hasGisData: /postgis safety|clearance/i.test(bodyText)
      };
    })()
  `);
  console.log('Query 1 Page State:', pageState1);

  console.log('3. Opening and Auditing Why Decision Modal...');
  await client.eval(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const whyBtn = buttons.find(b => /full audit|why/i.test(b.innerText));
      if (whyBtn) whyBtn.click();
    })()
  `);

  await sleep(1000);

  const modalState = await client.eval(`
    (() => {
      const bodyText = document.body.innerText;
      return {
        isModalOpen: /deterministic rule audit|audited evidence|close audit|rule evaluations/i.test(bodyText)
      };
    })()
  `);
  console.log('Modal Audit State:', modalState);

  // Close modal
  await client.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => /close|×/i.test(b.innerText));
      if (closeBtn) closeBtn.click();
    })()
  `);

  await sleep(1000);

  console.log('4. Testing Multi-Turn Follow-Up Query ("What about the afternoon?")...');
  await client.eval(`
    (() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'What about the afternoon?');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);

  await sleep(500);
  await client.eval(`
    (() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()
  `);

  await sleep(4000);

  const turn2State = await client.eval(`
    (() => {
      const bodyText = document.body.innerText;
      return {
        hasContextBadge: /conversational context maintained|inherited/i.test(bodyText),
        contextText: /conversational context maintained|inherited/i.test(bodyText) ? 'Inherited prior parameters' : 'None',
        bodySnippet: bodyText.substring(0, 500)
      };
    })()
  `);
  console.log('Turn 2 Multi-Turn Context State:', turn2State);

  console.log('5. Testing Mobile Viewport (375 × 812)...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });

  await sleep(1000);

  const mobileMetrics = await client.eval(`
    (() => {
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        inputVisible: !!document.querySelector('input[type="text"]'),
        submitVisible: !!document.querySelector('button[type="submit"]')
      };
    })()
  `);
  console.log('Mobile Viewport Metrics (375px):', mobileMetrics);

  const orcaApiCalls = client.networkRequests.filter(r => r.url.includes('/api/v1/orca/query'));
  const actualConsoleErrors = client.consoleLogs.filter(l => l.type === 'error');

  console.log('6. Intercepted Network & Console Metrics:');
  console.log(`- Intercepted /api/v1/orca/query POST calls: ${orcaApiCalls.length}`);
  console.log(`- Browser Console Errors: ${actualConsoleErrors.length}`);

  client.close();
  chromeProc.kill();

  const isSuccess = 
    pageState1.hasVerdict &&
    pageState1.hasRationale &&
    pageState1.hasAction &&
    modalState.isModalOpen &&
    turn2State.hasContextBadge &&
    !mobileMetrics.hasHorizontalOverflow &&
    orcaApiCalls.length >= 2 &&
    actualConsoleErrors.length === 0;

  console.log('====================================================');
  console.log(isSuccess ? '>>> PHASE 17 BROWSER CDP VERIFICATION: PASS <<<' : '>>> PHASE 17 BROWSER CDP VERIFICATION: FAILED <<<');
  console.log('====================================================');
}

main().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
