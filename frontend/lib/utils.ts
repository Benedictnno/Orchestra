import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(err: unknown): string {
  // If it's a string, return it
  if (typeof err === 'string') return err;

  // Handle Axios/Fetch error responses
  if (err && typeof err === 'object') {
    const errorObj = err as Record<string, unknown>;
    const data = ((errorObj.response as Record<string, unknown>)?.data || errorObj.data) as Record<string, unknown> | string | undefined;
    
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data.message === 'string') return data.message;
      if (data.error) {
        if (typeof data.error === 'string') return data.error;
        if (typeof (data.error as Record<string, unknown>).message === 'string') {
          return (data.error as Record<string, unknown>).message as string;
        }
        return 'An error occurred';
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        return first?.message || `Error in field: ${first?.field}`;
      }
    }

    if (typeof errorObj.message === 'string') return errorObj.message;
  }

  return 'An unexpected error occurred';
}
