// Receives Claude's pushes, keeps them for the feed, and shows them on the lock screen.
const PROJECT_URL = 'https://claude.ai/code/project/chan_018RSN8eBbdhCb2VDwseegbT';
const LABEL = { wait: 'Needs you', work: 'Started', done: 'Done', stuck: 'Stuck', info: 'Update' };
const DEFAULTS = { quietOn: true, quietFrom: '23:00', quietTo: '08:00', urgentRings: true };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('assistant', 2);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains('items')) r.result.createObjectStore('items', { keyPath: 'id' });
      if (!r.result.objectStoreNames.contains('settings')) r.result.createObjectStore('settings');
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
function req(store, mode, fn) {
  return db().then((d) => new Promise((res) => {
    const t = d.transaction(store, mode); const q = fn(t.objectStore(store));
    t.oncomplete = () => res(q && q.result); t.onerror = () => res(undefined);
  }));
}
const allItems = () => req('items', 'readonly', (s) => s.getAll()).then((r) => r || []);
const putItem = (it) => req('items', 'readwrite', (s) => s.put(it));
const getSettings = () => req('settings', 'readonly', (s) => s.get('prefs')).then((p) => ({ ...DEFAULTS, ...(p || {}) }));

function inQuiet(p, now = new Date()) {
  if (!p.quietOn) return false;
  const m = now.getHours() * 60 + now.getMinutes();
  const [fh, fm] = p.quietFrom.split(':').map(Number); const [th, tm] = p.quietTo.split(':').map(Number);
  const from = fh * 60 + fm; const to = th * 60 + tm;
  return from <= to ? m >= from && m < to : m >= from || m < to;
}

async function updateBadge() {
  const items = (await allItems()).sort((a, b) => b.ts - a.ts);
  const latest = new Map();
  for (const it of items) { const k = it.key || it.id; if (!latest.has(k)) latest.set(k, it); }
  const n = [...latest.values()].filter((i) => (i.kind === 'wait' || i.kind === 'stuck') && !i.cleared).length;
  if (self.navigator.setAppBadge) n ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge();
}
async function tellClients() {
  for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage('new');
}

self.addEventListener('push', (e) => {
  let it;
  try { it = e.data.json(); } catch { it = { title: 'Update', body: e.data ? e.data.text() : '' }; }
  it.id = it.id || String(Date.now());
  it.kind = it.kind || 'info';
  it.ts = it.ts || Date.now();
  it.url = it.url || PROJECT_URL;
  e.waitUntil((async () => {
    await putItem(it);
    await updateBadge();
    const p = await getSettings();
    const urgent = it.kind === 'wait' || it.kind === 'stuck';
    const silent = inQuiet(p) && !(urgent && p.urgentRings);
    const actions = urgent
      ? [{ action: 'open', title: 'Open in Claude' }, { action: 'handled', title: 'Handled' }]
      : [{ action: 'open', title: 'Open in Claude' }, { action: 'feed', title: 'See all' }];
    await self.registration.showNotification(it.title, {
      body: (it.key ? LABEL[it.kind] + ' · ' + it.key + '\n' : '') + (it.body || ''),
      // One notification per thread on the lock screen: the newest replaces the older one.
      tag: it.key || it.id, renotify: !silent, silent,
      icon: 'icon-192.png', badge: 'badge-96.png', timestamp: it.ts,
      requireInteraction: urgent, actions,
      vibrate: silent ? [] : urgent ? [300, 120, 300, 120, 300] : [250, 100, 250],
      data: { url: it.url, id: it.id },
    });
    await tellClients();
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  e.waitUntil((async () => {
    if (e.action === 'handled') {
      const it = (await allItems()).find((i) => i.id === data.id);
      if (it) { it.cleared = true; await putItem(it); }
      await updateBadge(); await tellClients();
      return;
    }
    if (e.action === 'feed') {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (wins.length) return wins[0].focus();
      return self.clients.openWindow('./');
    }
    return self.clients.openWindow(data.url || PROJECT_URL);
  })());
});
