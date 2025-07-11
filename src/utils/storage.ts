import { ShortLink, UserSettings } from "@/types";

const STORAGE_KEYS = {
  LINKS: "url-shortener-links",
  SETTINGS: "url-shortener-settings",
} as const;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open("PrefixLinkDB", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("links", { keyPath: "id" }); // id = `${prefix}/${alias}`
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export const storage = {
  getLinks: (): ShortLink[] => {
    try {
      const links = localStorage.getItem(STORAGE_KEYS.LINKS);
      return links ? JSON.parse(links) : [];
    } catch {
      return [];
    }
  },

  saveLinks: (links: ShortLink[]): void => {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },

  addLink: (link: ShortLink): void => {
    const links = storage.getLinks();
    links.unshift(link);
    storage.saveLinks(links);

    const id = `${link.prefix}/${link.alias}`;

    openDB().then((db) => {
      const tx = db.transaction("links", "readwrite");
      const store = tx.objectStore("links");
      store.put({ ...link, id });
    });
  },

  updateLink: (id: string, updates: Partial<ShortLink>): void => {
    const links = storage.getLinks();
    const index = links.findIndex((link) => link.id === id);
    if (index !== -1) {
      const updated = { ...links[index], ...updates };
      links[index] = updated;
      storage.saveLinks(links);

      openDB().then((db) => {
        const tx = db.transaction("links", "readwrite");
        tx.objectStore("links").put(updated);
      });
    }
  },

  deleteLink: (id: string): void => {
    const links = storage.getLinks().filter((link) => link.id !== id);
    storage.saveLinks(links);

    openDB().then((db) => {
      const tx = db.transaction("links", "readwrite");
      tx.objectStore("links").delete(id); // correct: use id = prefix/alias
    });
  },

  getSettings: (): UserSettings => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      return settings ? JSON.parse(settings) : { 
        preferredPrefix: '', 
        isFirstTime: true, 
        usePrefixBehavior: 'preferred',
        lastUsedPrefix: ''
      };
    } catch {
      return { 
        preferredPrefix: '', 
        isFirstTime: true, 
        usePrefixBehavior: 'preferred',
        lastUsedPrefix: ''
      };
    }
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};

export const generateShortCode = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
