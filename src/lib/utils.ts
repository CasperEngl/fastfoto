import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P] | null | undefined;
};

export function propertiesChanged<T extends Record<string, unknown>>(
  a: DeepPartial<T>,
  b: DeepPartial<T>,
): boolean {
  for (const key in a) {
    if (Object.prototype.hasOwnProperty.call(a, key) && a[key] !== b[key]) {
      return true;
    }
  }
  return false;
}
