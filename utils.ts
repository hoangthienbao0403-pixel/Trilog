import { JournalData, DailyEntry } from './types';

// Storage Keys
const STORAGE_KEY = 'trilog_data';

// Date Helpers
export const formatDateKey = (date: Date): string => {
  // Use local time components to ensure the date matches what the user sees
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Month is 0-indexed in JS Date constructor
  return new Date(year, month - 1, day);
};

export const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Storage Helpers
export const loadJournalData = (): JournalData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load data", e);
    return {};
  }
};

export const saveJournalData = (data: JournalData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const getEmptyEntry = (): DailyEntry => ({
  victory: { text: '', images: [] },
  anxiety: { text: '', images: [] },
  gratitude: { text: '', images: [] },
  lastUpdated: Date.now(),
});

// File Helpers
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};