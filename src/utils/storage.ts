import { ShortLink, UserSettings } from '@/types';

const STORAGE_KEYS = {
  LINKS: 'url-shortener-links',
  SETTINGS: 'url-shortener-settings',
} as const;

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
  },

  updateLink: (id: string, updates: Partial<ShortLink>): void => {
    const links = storage.getLinks();
    const index = links.findIndex(link => link.id === id);
    if (index !== -1) {
      links[index] = { ...links[index], ...updates };
      storage.saveLinks(links);
    }
  },

  deleteLink: (id: string): void => {
    const links = storage.getLinks().filter(link => link.id !== id);
    storage.saveLinks(links);
  },

  getSettings: (): UserSettings => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : { preferredPrefix: '', isFirstTime: true };
    } catch {
      return { preferredPrefix: '', isFirstTime: true };
    }
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};

export const generateShortCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};