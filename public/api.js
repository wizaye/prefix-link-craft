(async () => {
  const parts = window.location.pathname.split('/').filter(Boolean); // ['prefix', 'alias']
  const [prefix, alias] = parts;
  if (!prefix || !alias) return;

  const id = `${prefix}/${alias}`;

  // Load from IndexedDB into JSON memory
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('PrefixLinkDB', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('links', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  try {
    const db = await openDB();
    const tx = db.transaction('links', 'readonly');
    const store = tx.objectStore('links');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const link = getReq.result;

      if (link?.originalUrl) {
        // Update click count and re-save in both IndexedDB and window.linkStore
        const updatedLink = { ...link, clicks: (link.clicks || 0) + 1 };

        // IndexedDB
        const tx2 = db.transaction('links', 'readwrite');
        tx2.objectStore('links').put(updatedLink);

        // Update window.linkStore (if exists)
        if (window.linkStore) {
          window.linkStore[id] = updatedLink;
        }

        // Redirect
        window.location.href = link.originalUrl;
      } else {
        document.body.innerHTML = `
          <div style="font-family:sans-serif;text-align:center;margin-top:4rem;">
            <h1>🔗 Link Not Found</h1>
            <p>No link found for <strong>${id}</strong>.</p>
            <a href="/" style="margin-top:1rem;display:inline-block;color:#4F46E5">Back to Home</a>
          </div>
        `;
      }
    };

    getReq.onerror = () => {
      document.body.innerHTML = `<h2 style="text-align:center;font-family:sans-serif;margin-top:4rem;">Something went wrong while reading the link.</h2>`;
    };
  } catch (err) {
    console.error('IndexedDB error:', err);
    document.body.innerHTML = `<h2 style="text-align:center;margin-top:4rem;">Database error. Please try again later.</h2>`;
  }
})();
