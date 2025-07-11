// background.js

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const [prefix, alias] = text.trim().split('/');
  if (!prefix || !alias) return;

  const id = `${prefix}/${alias}`;

  // Open IndexedDB
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('PrefixLinkDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('links', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const tx = db.transaction('links', 'readonly');
  const store = tx.objectStore('links');
  const getReq = store.get(id);

  getReq.onsuccess = () => {
    const link = getReq.result;
    if (link?.originalUrl) {
      chrome.tabs.create({ url: link.originalUrl });
    } else {
      chrome.tabs.create({
        url: `data:text/html,<h1 style="font-family:sans-serif;">No link found for <strong>${id}</strong></h1>`
      });
    }
  };

  getReq.onerror = () => {
    chrome.tabs.create({
      url: `data:text/html,<h1 style="font-family:sans-serif;">Error reading from storage</h1>`
    });
  };
});
