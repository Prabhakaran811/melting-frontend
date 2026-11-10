import type { Order } from "./orderTypes";

const STORAGE_KEY = "mes.orderQueue";

export function loadSequence(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => Number.isInteger(x)) : [];
  } catch {
    return [];
  }
}

export function saveSequence(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: the queue just won't persist */
  }
}

export function clearSequence(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// Orders follow the saved queue; orders not in it yet go last, by ID
export function applySequence(orders: Order[], sequence: number[]): Order[] {
  const position = new Map<number, number>();
  sequence.forEach((id, index) => position.set(id, index));

  return [...orders].sort((a, b) => {
    const pa = position.get(a.id);
    const pb = position.get(b.id);

    if (pa === undefined && pb === undefined) return a.id - b.id;
    if (pa === undefined) return 1;
    if (pb === undefined) return -1;
    return pa - pb;
  });
}

// Moves one id to the position of another (above when moving up, below when moving down)
export function moveId(ids: number[], dragId: number, targetId: number): number[] {
  const from = ids.indexOf(dragId);
  const to = ids.indexOf(targetId);
  if (from === -1 || to === -1 || from === to) return ids;

  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, dragId);
  return next;
}