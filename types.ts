export interface JournalItem {
  text: string;
  emoji?: string;
  images: string[]; // Base64 strings
  audio?: string; // Base64 string
}

export interface DailyEntry {
  victory: JournalItem;
  anxiety: JournalItem;
  gratitude: JournalItem;
  lastUpdated: number;
}

export interface JournalData {
  [dateString: string]: DailyEntry; // Key format: YYYY-MM-DD
}

export enum ViewState {
  CALENDAR = 'CALENDAR',
  STATS = 'STATS'
}

export type CategoryType = 'victory' | 'anxiety' | 'gratitude';