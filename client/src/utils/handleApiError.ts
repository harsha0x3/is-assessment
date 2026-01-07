// utils/handleApiError.ts
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(err: unknown): string | null {
  const fetchError = err as FetchBaseQueryError;

  if (fetchError?.data && typeof fetchError.data === "object") {
    const data = fetchError.data as { detail?: string };
    return data.detail ?? null;
  }

  return null;
}
