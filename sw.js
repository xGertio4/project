// Receives Claude's pushes, keeps them for the feed, and shows them on the lock screen.
const PROJECT_URL = 'https://claude.ai/code/project/chan_018RSN8eBbdhCb2VDwseegbT';
const LABEL = { wait: 'Needs you', work: 'Started', done: 'Done', stuck: 'Stuck', info: 'Update' };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('assistant', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('items', { keyPath: 'id' });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function save(it) {
  const d = await db();
  await new Promise((res) => { const t = d.transaction('items', 'readwrite'); t.objectStore('items').put(it); t.oncomplete = res; t.onerror = res; });
}
async function waitingCount() {
  const d = await db();
  const items = await new Promise((res) => { const q = d.transaction('items').objectStore('items').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); });
  const latest = new Map();
  for (const it of items.sort((a, b) => b.ts - a.ts)) { const k = it.key || it.id; if (!latest.has(k)) latest.set(k, it); }
  return [...latest.values()].filter((i) => (i.kind === 'wait' || i.kind === 'stuck') && !i.cleared).length;
}

self.addEventListener('push', (e) => {
  let it;
  try { it = e.data.json(); } catch { it = { title: 'Update', body: e.data ? e.data.text() : '' }; }
  it.id = it.id || String(Date.now());
  it.kind = it.kind || 'info';
  it.ts = it.ts || Date.now();
  it.url = it.url || PROJECT_URL;
  e.waitUntil((async () => {
    await save(it);
    const n = await waitingCount();
    if (self.navigator.setAppBadge) n ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge();
    await self.registration.showNotification(it.title, {
      body: (it.key ? LABEL[it.kind] + ' · ' + it.key + '\n' : '') + (it.body || ''),
      tag: it.id, icon: 'icon-192.png', badge: 'badge-96.png', timestamp: it.ts,
      requireInteraction: it.kind === 'wait' || it.kind === 'stuck',
      data: { url: it.url },
    });
    for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage('new');
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow((e.notification.data && e.notification.data.url) || PROJECT_URL));
});
