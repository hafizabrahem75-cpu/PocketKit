export type ActivityItemType = "note" | "pdf" | "qr" | "ocr" | "scan";

export interface ActivityItem {
  id: string;
  type: ActivityItemType;
  preview: string;
  ts: number;
}

const VISITS_KEY = "pocketkit.activity.visits";
const RECENTS_KEY = "pocketkit.activity.recents";
const FAVORITES_KEY = "pocketkit.activity.favorites";
const ITEMS_KEY = "pocketkit.activity.items";
const MAX_ITEMS = 20;
const MAX_RECENTS = 8;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors silently
  }
}

export function recordVisit(href: string): void {
  const visits = safeGet<Record<string, number>>(VISITS_KEY, {});
  visits[href] = (visits[href] ?? 0) + 1;
  safeSet(VISITS_KEY, visits);

  const recents = safeGet<Array<{ href: string; ts: number }>>(RECENTS_KEY, []);
  const filtered = recents.filter((r) => r.href !== href);
  filtered.unshift({ href, ts: Date.now() });
  safeSet(RECENTS_KEY, filtered.slice(0, MAX_RECENTS));
}

export function getVisits(): Record<string, number> {
  return safeGet<Record<string, number>>(VISITS_KEY, {});
}

export function getRecents(): Array<{ href: string; ts: number }> {
  return safeGet<Array<{ href: string; ts: number }>>(RECENTS_KEY, []);
}

export function getMostUsed(n: number): string[] {
  const visits = getVisits();
  return Object.entries(visits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([href]) => href);
}

export function getFavorites(): string[] {
  return safeGet<string[]>(FAVORITES_KEY, []);
}

export function toggleFavorite(href: string): string[] {
  const favs = getFavorites();
  const next = favs.includes(href)
    ? favs.filter((h) => h !== href)
    : [...favs, href];
  safeSet(FAVORITES_KEY, next);
  return next;
}

export function addItem(item: Omit<ActivityItem, "id">): void {
  const items = safeGet<ActivityItem[]>(ITEMS_KEY, []);
  const newItem: ActivityItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  items.unshift(newItem);
  safeSet(ITEMS_KEY, items.slice(0, MAX_ITEMS));
}

export function getItems(): ActivityItem[] {
  return safeGet<ActivityItem[]>(ITEMS_KEY, []);
}
