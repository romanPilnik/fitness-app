import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'of:displayRir';
const CHANGE_EVENT = 'of:displayRir-preference';

function read(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return false;
  return raw === '1' || raw === 'true';
}

export function getDisplayRirPreference(): boolean {
  return read();
}

export function setDisplayRirPreference(value: boolean): void {
  localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onStoreChange();
  };
  const onLocal = () => onStoreChange();
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onLocal);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onLocal);
  };
}

export function useDisplayRirPreference(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
