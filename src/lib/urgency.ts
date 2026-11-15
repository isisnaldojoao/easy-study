import type { UrgencyBucket } from "@/lib/dates";

export function urgencyBadgeVariant(
  bucket: UrgencyBucket
): "danger" | "warning" | "default" | "secondary" | "outline" {
  switch (bucket) {
    case "atrasado":
      return "danger";
    case "hoje":
    case "amanha":
      return "warning";
    case "proximos_3":
      return "default";
    case "proximos_7":
      return "secondary";
    default:
      return "outline";
  }
}

export function matchesSearch(haystack: string, query: string) {
  if (!query.trim()) return true;
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}
