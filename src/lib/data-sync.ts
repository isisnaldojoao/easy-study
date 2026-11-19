const listeners = new Set<() => void>();

export function onDataChange(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDataChange() {
  listeners.forEach((listener) => listener());
}
