// Boss Wesley's assistant: receives Claude's pushes, keeps them for the app, shows them on the lock screen.
const PROJECT_URL = 'https://claude.ai/code/project/chan_018RSN8eBbdhCb2VDwseegbT';
const LOGO = 'https://d8j0ntlcm91z4.cloudfront.net/user_39lXpVmJGYmfIDH38JTzV7BC6Ww/hf_20261020_194658_a94d7728-2980-4476-b683-44e6aebf1b9b.png';
const LABEL = { wait: 'Needs you', work: 'Started', done: 'Done', stuck: 'Stuck', info: 'Update', brief: 'Brief' };
const DEFAULTS = { quietOn: true, quietFrom: '23:00', quietTo: '08:00', urgentRings: true };
const SHELL = 'shell-v4';
const SHELL_FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'badge-96.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});
// Network first so updates land straight away; the cached copy keeps the app opening offline.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone();
    caches.open(SHELL).then((c) => c.put(e.request, copy)).catch(() => {});
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
});

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
async function tell(msg) {
  for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(msg);
}

self.addEventListener('push', (e) => {
  let it;
  try { it = e.data.json(); } catch { it = { title: 'Update', body: e.data ? e.data.text() : '' }; }
  it.id = it.id || String(Date.now());
  it.kind = it.kind || 'info';
  it.ts = it.ts || Date.now();
  it.url = it.url || PROJECT_URL;
  it.read = false;
  e.waitUntil((async () => {
    await putItem(it);
    await updateBadge();
    const p = await getSettings();
    const urgent = it.kind === 'wait' || it.kind === 'stuck';
    const rings = urgent ? p.urgentRings : it.kind === 'brief';
    const silent = inQuiet(p) && !rings;
    const actions = urgent
      ? [{ action: 'handled', title: 'Handled' }, { action: 'thread', title: 'Open thread' }]
      : it.kind === 'brief'
        ? [{ action: 'play', title: 'Play' }, { action: 'dismiss', title: 'Dismiss' }]
        : [{ action: 'thread', title: 'Open thread' }, { action: 'dismiss', title: 'Dismiss' }];
    await self.registration.showNotification(it.title, {
      body: (it.key && it.kind !== 'brief' ? LABEL[it.kind] + ' · ' + it.key + '\n' : '') + (it.body || ''),
      // One card per thread on the lock screen: the newest replaces the older one.
      tag: it.key || it.id, renotify: !silent, silent,
      icon: LOGO, badge: 'badge-96.png', timestamp: it.ts,
      requireInteraction: urgent, actions,
      vibrate: silent ? [] : urgent ? [300, 120, 300, 120, 300] : [250, 100, 250],
      data: { url: it.url, id: it.id },
    });
    await tell({ type: 'new', id: it.id });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  e.waitUntil((async () => {
    const it = (await allItems()).find((i) => i.id === data.id);
    if (e.action === 'handled' || e.action === 'dismiss') {
      if (it) { if (e.action === 'handled') it.cleared = true; it.read = true; await putItem(it); }
      await updateBadge(); await tell({ type: 'changed' });
      return;
    }
    if (e.action === 'thread') {
      if (it) { it.read = true; await putItem(it); }
      return self.clients.openWindow(data.url || PROJECT_URL);
    }
    // Tapping the notification itself opens the app on that update; Play (or tapping a brief) reads it out loud.
    const play = e.action === 'play' ? 'force' : it && it.kind === 'brief' ? 'auto' : '';
    const target = new URL('./#item=' + encodeURIComponent(data.id || '') + (play ? '&play=' + play : ''), self.registration.scope).href;
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const mine = wins.find((w) => w.url.startsWith(self.registration.scope));
    if (mine) { await mine.focus(); mine.postMessage({ type: 'open', id: data.id, play }); return; }
    return self.clients.openWindow(target);
  })());
});
