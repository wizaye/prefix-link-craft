export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  alias: string;
  prefix: string;
  clicks: number;
  createdAt: string;
}

export interface UserSettings {
  preferredPrefix: string;
  isFirstTime: boolean;
}