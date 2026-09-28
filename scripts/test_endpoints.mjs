import http from 'http';

function checkUrl(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.end();
  });
}

async function run() {
  console.log('Testing endpoints...');
  const health = await checkUrl('http://localhost:3001/api/v1/health');
  console.log('Backend Health:', health);

  const adapters = await checkUrl('http://localhost:3001/api/v1/adapters');
  console.log('Adapters:', adapters.status, adapters.data ? adapters.data.substring(0, 150) : '');

  const pfz = await checkUrl('http://localhost:3001/api/v1/pfz');
  console.log('PFZ:', pfz.status, pfz.data ? pfz.data.substring(0, 150) : '');

  const obs = await checkUrl('http://localhost:3001/api/v1/observations');
  console.log('Observations:', obs.status, obs.data ? obs.data.substring(0, 150) : '');

  const alerts = await checkUrl('http://localhost:3001/api/v1/alerts');
  console.log('Alerts:', alerts.status, alerts.data ? alerts.data.substring(0, 150) : '');

  const conn = await checkUrl('http://localhost:3001/api/v1/connectivity/status');
  console.log('Connectivity:', conn.status, conn.data ? conn.data.substring(0, 150) : '');

  const fe = await checkUrl('http://localhost:5173/');
  console.log('Frontend:', fe.status, fe.data ? fe.data.substring(0, 100) : '');
}

run();
