function snake(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function camel(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function toSnake(input: object) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    out[snake(key)] = value;
  }
  return out;
}

export function toCamel<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[camel(key)] = value === null ? undefined : value;
  }
  return out as T;
}

export function asDate(value: unknown) {
  if (typeof value !== "string") return value;
  return value.slice(0, 10);
}
