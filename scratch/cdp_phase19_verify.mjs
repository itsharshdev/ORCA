import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const FRONTEND_URL = 'http://localhost:5173';
const USER_DATA_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity-ide\\brain\\4f1b062b-81fa-42f9-a78e-b94c04ff648d\\scratch\\chrome_p19';

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
  console.log('=== PHASE 19 BROWSER CDP VERIFICATION ===');
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,900',
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

  console.log('1. Navigating to Alerts Center (/alerts)...');
  await client.send('Page.navigate', { url: `${FRONTEND_URL}/alerts` });
  await sleep(3000);

  // 2. Click ALL status filter so all alerts are visible
  console.log('2. Setting Status filter to ALL...');
  await client.eval(`
    (() => {
      const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'ALL');
      if (allBtn) allBtn.click();
    })()
  `);
  await sleep(1000);

  const alertsListInfo = await client.eval(`
    (() => {
      const text = document.body.innerText;
      const cards = document.querySelectorAll('.rounded-2xl.border');
      return {
        hasTitle: /Maritime Hazard & Alert Center/i.test(text),
        cardCount: cards.length,
        hasCriticalAlert: /CRITICAL/i.test(text),
        hasWarningAlert: /WARNING/i.test(text),
        hasAdvisoryAlert: /ADVISORY/i.test(text),
        hasDemoLabel: /DEMO|ACCESS PENDING/i.test(text),
        hasLiveLabel: /LIVE/i.test(text)
      };
    })()
  `);
  console.log('Alerts List State:', alertsListInfo);

  // 3. Open Alert Detail Modal for an ACTIVE alert (e.g. ALT-2026-003 or any ACTIVE alert)
  console.log('3. Opening Alert Detail Modal for an ACTIVE alert to Acknowledge...');
  await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
      const activeCard = cards.find(c => c.innerText.includes('ALT-2026-001')) || cards[0];
      if (activeCard) {
        const auditBtn = Array.from(activeCard.querySelectorAll('button')).find(b => b.innerText.includes('Audit Details'));
        if (auditBtn) auditBtn.click();
      }
    })()
  `);
  await sleep(1500);

  const modalLevel1Info = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasLevel1Tab: /Level 1: What & Action/i.test(text),
        hasLevel2Tab: /Level 2: Why/i.test(text),
        hasLevel3Tab: /Level 3: Evidence/i.test(text),
        hasLevel4Tab: /Level 4: Rule Trace/i.test(text),
        level1_WhatWhere: /WHAT HAPPENED|WHERE AFFECTED|DETERMINISTIC SEVERITY|VALIDITY WINDOW|RECOMMENDED ACTION/i.test(text),
        level1_Severity: /CRITICAL|WARNING|ADVISORY/i.test(text),
        hasHonestStatus: /ACCESS PENDING|DEMO SNAPSHOT|LIVE TELEMETRY/i.test(text),
        hasAcknowledgeBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Acknowledge Alert'))
      };
    })()
  `);
  console.log('Modal Level 1 State:', modalLevel1Info);

  // 4. Click Level 2: Why (Driver) Tab
  console.log('4. Inspecting Level 2 Why (Driver) Tab...');
  await client.eval(`
    (() => {
      const whyBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Level 2: Why'));
      if (whyBtn) whyBtn.click();
    })()
  `);
  await sleep(800);

  const level2Info = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasDriverHeading: /Deterministic Reason|Deterministic Driver|Why/i.test(text),
        hasProvenanceCard: /Source Provenance Audit|Provenance/i.test(text),
        hasSourceStatus: /LIVE|ACCESS_PENDING|DEMO/i.test(text)
      };
    })()
  `);
  console.log('Level 2 Why State:', level2Info);

  // 5. Click Level 3: Evidence Tab
  console.log('5. Inspecting Level 3 Audited Evidence Tab...');
  await client.eval(`
    (() => {
      const evTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Level 3: Evidence'));
      if (evTab) evTab.click();
    })()
  `);
  await sleep(800);

  const level3Info = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasEvidenceHeading: /Verified Evidence Items|Audited Evidence/i.test(text),
        hasEvidenceCard: document.querySelectorAll('.shadow-2xs.flex.flex-col').length > 0,
        hasSourceTag: /Source:/i.test(text)
      };
    })()
  `);
  console.log('Level 3 Evidence State:', level3Info);

  // 6. Click Level 4: Rule Trace Tab
  console.log('6. Inspecting Level 4 Deterministic Rule Audit Tab...');
  await client.eval(`
    (() => {
      const ruleTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Level 4: Rule Trace'));
      if (ruleTab) ruleTab.click();
    })()
  `);
  await sleep(800);

  const level4Info = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasRuleHeading: /Deterministic Rule Evaluations/i.test(text),
        hasRuleCode: /RULE_/i.test(text),
        hasRuleResult: /RESULT:/i.test(text),
        hasThreshold: /Threshold Source/i.test(text)
      };
    })()
  `);
  console.log('Level 4 Rule Trace State:', level4Info);

  // 7. Acknowledge Alert in Modal
  console.log('7. Acknowledging Alert in Modal...');
  await client.eval(`
    (() => {
      const noteInput = document.querySelector('input[placeholder*="Optional operator justification"]');
      if (noteInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(noteInput, 'Acknowledged by duty officer on watch');
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
        noteInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const ackBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Acknowledge Alert'));
      if (ackBtn) ackBtn.click();
    })()
  `);
  await sleep(2000);

  const ackState = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        isAcknowledgedInModal: /ACKNOWLEDGED/i.test(text)
      };
    })()
  `);
  console.log('Acknowledgement State:', ackState);

  // Close modal
  await client.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(800);

  // 8. Open an un-resolved alert (e.g. ALT-2026-004 or ALT-2026-005) to Resolve
  console.log('8. Opening an active/acknowledged alert to Resolve...');
  await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
      const resolvableCard = cards.find(c => c.innerText.includes('ALT-2026-002')) || cards[0];
      if (resolvableCard) {
        const btn = Array.from(resolvableCard.querySelectorAll('button')).find(b => b.innerText.includes('Audit Details'));
        if (btn) btn.click();
      }
    })()
  `);
  await sleep(1500);

  console.log('Resolving alert with resolution note...');
  await client.eval(`
    (() => {
      const noteInput = document.querySelector('input[placeholder*="Optional operator justification"]');
      if (noteInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(noteInput, 'Verified condition mitigated and safety buffer cleared');
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
        noteInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const resolveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Resolve Alert'));
      if (resolveBtn) resolveBtn.click();
    })()
  `);
  await sleep(2000);

  const resolveState = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasResolvedState: /RESOLVED/i.test(text)
      };
    })()
  `);
  console.log('Resolution State in Modal:', resolveState);

  // Close modal
  await client.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(800);

  // 9. Reload Page to verify backend persistence in Fastify
  console.log('9. Reloading Page to verify backend persistence...');
  await client.send('Page.reload');
  await sleep(3000);

  // Select ALL filter again after reload
  await client.eval(`
    (() => {
      const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'ALL');
      if (allBtn) allBtn.click();
    })()
  `);
  await sleep(1000);

  const persistedState = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasAckBadge: /ACKNOWLEDGED/i.test(text),
        hasResolvedBadge: /RESOLVED/i.test(text)
      };
    })()
  `);
  console.log('Persisted Statuses after Reload:', persistedState);

  // 10. Test Filter / Search Empty State
  console.log('10. Testing Filter / Search Empty State...');
  await client.eval(`
    (() => {
      const searchInput = document.querySelector('input[placeholder*="Search alerts"]');
      if (searchInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(searchInput, 'nonexistent_hazard_xyz');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(800);

  const emptyFilterState = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasEmptyMessage: /No Operational Alerts Found/i.test(text)
      };
    })()
  `);
  console.log('Filter Empty State:', emptyFilterState);

  // Clear search
  await client.eval(`
    (() => {
      const searchInput = document.querySelector('input[placeholder*="Search alerts"]');
      if (searchInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(searchInput, '');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(800);

  // 11. Navigate to Disaster Management workspace (/disaster)
  console.log('11. Navigating to Disaster Management Workspace (/disaster)...');
  await client.send('Page.navigate', { url: `${FRONTEND_URL}/disaster` });
  await sleep(3000);

  const disasterPageState = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasTitle: /Coastal Hazard Exposure & Emergency Coordination/i.test(text),
        hasActiveHazardsRibbon: /Active Coastal Hazards/i.test(text),
        hasTacticalMap: /Hazard Spatial Extent & Buffer Perimeter/i.test(text),
        hasExposedCrafts: /Exposed Crafts in Perimeter/i.test(text),
        hasInspectAuditBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Inspect Audit (Level 1-4)'))
      };
    })()
  `);
  console.log('Disaster Management Workspace State:', disasterPageState);

  // Open modal from Disaster view
  console.log('Opening Audit Modal from Disaster Management view...');
  await client.eval(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Inspect Audit (Level 1-4)'));
      if (btn) btn.click();
    })()
  `);
  await sleep(1500);

  const disasterModalState = await client.eval(`
    (() => {
      return {
        isOpen: /Level 1: What & Action/i.test(document.body.innerText)
      };
    })()
  `);
  console.log('Disaster Management Modal Open:', disasterModalState);

  // Close modal
  await client.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(800);

  // 12. Role-Specific Alert Presentation Verification
  console.log('12. Testing Role-Specific Alert Presentation on /alerts...');
  await client.send('Page.navigate', { url: `${FRONTEND_URL}/alerts` });
  await sleep(2500);

  // Switch to Fisherman
  await client.eval(`
    (() => {
      const select = Array.from(document.querySelectorAll('select')).find(s => 
        Array.from(s.options).some(o => o.value === 'FISHERMAN')
      );
      if (select) {
        select.value = 'FISHERMAN';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(1000);

  const fishermanAlertView = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasActionableGuidance: /Actionable Guidance:/i.test(text),
        hasValidUntil: /Valid until/i.test(text),
        noRawCodeClutter: !/ZOD_SCHEMA_VALIDATION_ERROR/i.test(text)
      };
    })()
  `);
  console.log('Fisherman Alert View State:', fishermanAlertView);

  // Switch to Coastal Authority
  await client.eval(`
    (() => {
      const select = Array.from(document.querySelectorAll('select')).find(s => 
        Array.from(s.options).some(o => o.value === 'COASTAL_AUTHORITY')
      );
      if (select) {
        select.value = 'COASTAL_AUTHORITY';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(1000);

  const authorityAlertView = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        hasAffectedVesselsMeta: /Affected Vessels:/i.test(text),
        hasRuleMeta: /Rule:/i.test(text),
        hasCategoryFilter: /Category:/i.test(text)
      };
    })()
  `);
  console.log('Authority Alert View State:', authorityAlertView);

  // 13. Mobile Viewport (375 × 812)
  console.log('13. Testing Mobile Viewport (375 × 812)...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(1500);

  const mobileMetrics = await client.eval(`
    (() => {
      const clientWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      return {
        clientWidth,
        scrollWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth,
        cardsVisible: document.querySelectorAll('.rounded-2xl.border').length > 0
      };
    })()
  `);
  console.log('Mobile Viewport Metrics (375px):', mobileMetrics);

  // Open modal in mobile view to check responsive modal
  await client.eval(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const auditBtn = buttons.find(b => b.innerText.includes('Audit Details'));
      if (auditBtn) auditBtn.click();
    })()
  `);
  await sleep(1500);

  const mobileModalMetrics = await client.eval(`
    (() => {
      const clientWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      return {
        clientWidth,
        scrollWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth,
        modalIsOpen: /Level 1: What & Action/i.test(document.body.innerText)
      };
    })()
  `);
  console.log('Mobile Modal Metrics:', mobileModalMetrics);

  // Close mobile modal
  await client.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(800);

  // 14. Network & Console Metrics Audit
  const alertsApiCalls = client.networkRequests.filter(r => r.url.includes('/api/v1/alerts'));
  const ackApiCalls = client.networkRequests.filter(r => r.url.includes('/acknowledge'));
  const resolveApiCalls = client.networkRequests.filter(r => r.url.includes('/resolve'));
  const consoleErrors = client.consoleLogs.filter(l => l.type === 'error');

  console.log('14. Intercepted Network & Console Metrics:');
  console.log(`- Intercepted /api/v1/alerts calls: ${alertsApiCalls.length}`);
  console.log(`- Intercepted /acknowledge POST calls: ${ackApiCalls.length}`);
  console.log(`- Intercepted /resolve POST calls: ${resolveApiCalls.length}`);
  console.log(`- Browser Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  // 15. Honesty Audit in DOM
  const honestyCheck = await client.eval(`
    (() => {
      const text = document.body.innerText;
      return {
        noGuaranteedSafe: !/guaranteed safe|100% accurate|zero hallucinations|autonomous emergency response/i.test(text),
        hasHonestDemoDisclaimer: /DEMO|ACCESS PENDING/i.test(text)
      };
    })()
  `);
  console.log('Honesty Check Result:', honestyCheck);

  client.close();
  chromeProc.kill();

  const isSuccess = 
    alertsListInfo.hasTitle &&
    alertsListInfo.cardCount > 0 &&
    modalLevel1Info.hasLevel1Tab &&
    modalLevel1Info.level1_WhatWhere &&
    level2Info.hasDriverHeading &&
    level3Info.hasEvidenceHeading &&
    level4Info.hasRuleHeading &&
    ackState.isAcknowledgedInModal &&
    resolveState.hasResolvedState &&
    persistedState.hasAckBadge &&
    persistedState.hasResolvedBadge &&
    emptyFilterState.hasEmptyMessage &&
    disasterPageState.hasTitle &&
    disasterPageState.hasActiveHazardsRibbon &&
    disasterModalState.isOpen &&
    fishermanAlertView.hasActionableGuidance &&
    authorityAlertView.hasAffectedVesselsMeta &&
    !mobileMetrics.hasHorizontalOverflow &&
    !mobileModalMetrics.hasHorizontalOverflow &&
    alertsApiCalls.length >= 1 &&
    ackApiCalls.length >= 1 &&
    resolveApiCalls.length >= 1 &&
    consoleErrors.length === 0 &&
    honestyCheck.noGuaranteedSafe;

  console.log('====================================================');
  console.log(isSuccess ? '>>> PHASE 19 REAL BROWSER CDP VERIFICATION: PASS <<<' : '>>> PHASE 19 REAL BROWSER CDP VERIFICATION: FAILED <<<');
  console.log('====================================================');

  if (!isSuccess) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('CDP verification fatal error:', err);
  process.exit(1);
});
