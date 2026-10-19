// Steady Gains - on-device storage. The whole app object is one record in
// IndexedDB (six months of logs is well under a megabyte). Falls back to
// localStorage where IndexedDB isn't available, e.g. some private windows.

const DB_NAME = "steady-gains";
const STORE = "kv";
const KEY = "app";

function openDb() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in self)) return reject(new Error("no indexedDB"));
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function tx(db, mode, fn) {
    return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req && req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
    });
}

let dbPromise = null;
function db() {
    if (!dbPromise) dbPromise = openDb();
    return dbPromise;
}

export async function loadApp() {
    try {
        const value = await tx(await db(), "readonly", s => s.get(KEY));
        if (value) return value;
    } catch (e) { /* fall through to localStorage */ }
    try {
        const raw = localStorage.getItem(DB_NAME);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

// Writes are queued so a burst of quick taps never saves out of order.
let queue = Promise.resolve();
export function saveApp(app) {
    queue = queue.then(async () => {
        try {
            await tx(await db(), "readwrite", s => s.put(app, KEY));
        } catch (e) {
            try { localStorage.setItem(DB_NAME, JSON.stringify(app)); } catch (e2) { console.error("Could not save", e2); }
        }
    });
    return queue;
}

export async function clearApp() {
    try { await tx(await db(), "readwrite", s => s.delete(KEY)); } catch (e) { /* ignore */ }
    try { localStorage.removeItem(DB_NAME); } catch (e) { /* ignore */ }
}

// Ask the browser not to evict the training log under storage pressure.
export async function requestPersistence() {
    try {
        if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
    } catch (e) { /* ignore */ }
    return false;
}
