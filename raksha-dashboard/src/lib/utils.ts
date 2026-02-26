import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * To Merge Tailwind classes safely, resolving conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}