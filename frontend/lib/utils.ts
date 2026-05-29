import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Backend returns timestamps without timezone (e.g. "2026-05-29T09:35:13").
// Without "Z", browsers parse as local time — wrong for users outside UTC.
export function parseUTC(ts: string): Date {
  return new Date(ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z");
}
