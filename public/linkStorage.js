// public/linkStorage.js

const dbName = 'PrefixLinkDB';
const storeName = 'links';

let linkStore = {}; // JSON representation in memory

// Open or upgrade IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(storeName, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Load all links from IndexedDB into memory
export async function loadLinks() {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const getAll = store.getAll();

  return new Promise((resolve, reject) => {
    getAll.onsuccess = () => {
      linkStore = {};
      getAll.result.forEach(link => {
        linkStore[link.id] = link;
      });
      resolve(linkStore);
    };
    getAll.onerror = () => reject(getAll.error);
  });
}

// Add or update a link
export async function saveLink(link) {
  linkStore[link.id] = link;
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(link);
}

// Delete a link
export async function deleteLink(id) {
  delete linkStore[id];
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(id);
}

// Get all in-memory links
export function getAllLinks() {
  return Object.values(linkStore);
}

// Get a specific link
export function getLink(id) {
  return linkStore[id] || null;
}
